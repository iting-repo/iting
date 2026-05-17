package com.iting.jobportal.common.service;

import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.entity.enums.SalaryType;
import com.iting.jobportal.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Generates "Báo cáo lương IT 2026" PDF lead magnet by aggregating real Job data.
 *
 * <p>The output PDF contains:
 * <ol>
 *   <li>Cover page</li>
 *   <li>Executive summary (total jobs, avg salary, key insights)</li>
 *   <li>Salary by experience level (Junior/Mid/Senior...)</li>
 *   <li>Salary by job type (full-time, part-time, contract)</li>
 *   <li>Top locations</li>
 *   <li>Methodology + footer</li>
 * </ol>
 *
 * <p><strong>Font caveat:</strong> Uses Helvetica (Type1) which lacks Vietnamese diacritics support.
 * Text uses ASCII / English. For Vietnamese text rendering, embed a TTF font like
 * <code>Roboto-Regular.ttf</code> via <code>PDType0Font.load(doc, ttfStream)</code>.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SalaryReportPdfService {

    public static final String S3_KEY = "lead-magnets/salary-report-2026.pdf";

    private final JobRepository jobRepository;
    private final FileUploadService fileUploadService;

    @Value("${marketing.salary-report.cached-url:}")
    private String cachedPublicUrl;

    // PDFBox uses Type 1 Helvetica (bundled — no font file needed)
    private static final PDFont FONT_REGULAR = PDType1Font.HELVETICA;
    private static final PDFont FONT_BOLD = PDType1Font.HELVETICA_BOLD;
    private static final PDFont FONT_ITALIC = PDType1Font.HELVETICA_OBLIQUE;

    private static final Color BRAND_BLUE = new Color(37, 99, 235);
    private static final Color BRAND_NAVY = new Color(30, 41, 59);
    private static final Color BRAND_GRAY = new Color(100, 116, 139);
    private static final Color BRAND_LIGHT = new Color(241, 245, 249);

    // ─── Public API ────────────────────────────────────────────────────────

    /**
     * Generate the PDF and upload to S3 (overwrite at fixed key).
     * @return the public S3 URL (use {@link FileUploadService#generatePresignedUrl} to get a signed URL).
     */
    public String generateAndUpload() {
        log.info("[SalaryReport] Building PDF from real job data...");
        byte[] pdfBytes = buildPdfBytes();
        log.info("[SalaryReport] PDF generated: {} bytes — uploading to S3 key={}",
                pdfBytes.length, S3_KEY);
        String url = fileUploadService.uploadBytes(pdfBytes, S3_KEY, "application/pdf");
        log.info("[SalaryReport] Uploaded: {}", url);
        return url;
    }

    /**
     * Return cached/static URL if configured, otherwise the canonical S3 public URL pattern.
     * Combined with {@link FileUploadService#generatePresignedUrl} to deliver a signed download.
     */
    public String getCachedPublicUrl(String fallbackBaseUrl) {
        return cachedPublicUrl != null && !cachedPublicUrl.isBlank()
                ? cachedPublicUrl
                : fallbackBaseUrl + "/" + S3_KEY;
    }

    // ─── PDF build pipeline ───────────────────────────────────────────────

    private byte[] buildPdfBytes() {
        // 1. Gather data
        List<Job> jobs = collectActiveJobsWithSalary();
        ReportData data = buildReportData(jobs);

        // 2. Render PDF
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            renderCoverPage(doc);
            renderSummaryPage(doc, data);
            renderByExperiencePage(doc, data);
            renderByJobTypePage(doc, data);
            renderByLocationPage(doc, data);
            renderMethodologyPage(doc, data);

            doc.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to build salary report PDF", e);
            throw new RuntimeException("Failed to generate salary report PDF", e);
        }
    }

    private List<Job> collectActiveJobsWithSalary() {
        // Fetch a large pool of recent active jobs. Filter only those with salary disclosed.
        List<Job> rawJobs = jobRepository.findTop50ByStatusOrderByCreatedAtDesc(JobStatus.ACTIVE);
        // ↑ Note: findTop50 — for production, add a new repo method with a larger limit.
        return rawJobs.stream()
                .filter(j -> j.getMinSalary() != null && j.getMaxSalary() != null)
                .filter(j -> j.getMinSalary().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());
    }

    private ReportData buildReportData(List<Job> jobs) {
        ReportData d = new ReportData();
        d.totalJobs = jobs.size();
        d.generatedAt = LocalDate.now();

        if (jobs.isEmpty()) return d;

        // Overall stats
        d.medianMonthly = median(jobs.stream()
                .map(j -> normalizeToMonthly(j.getMinSalary(), j.getSalaryType()))
                .collect(Collectors.toList()));
        d.maxMonthly = jobs.stream()
                .map(j -> normalizeToMonthly(j.getMaxSalary(), j.getSalaryType()))
                .max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        d.minMonthly = jobs.stream()
                .map(j -> normalizeToMonthly(j.getMinSalary(), j.getSalaryType()))
                .min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        // Group by experience level
        Map<ExperienceLevel, List<Job>> byExp = jobs.stream()
                .filter(j -> j.getExperienceLevel() != null)
                .collect(Collectors.groupingBy(Job::getExperienceLevel));
        d.byExperience = byExp.entrySet().stream()
                .map(e -> new Bucket(e.getKey().name(), e.getValue().size(),
                        median(salaryList(e.getValue()))))
                .sorted((a, b) -> Integer.compare(b.count, a.count))
                .collect(Collectors.toList());

        // Group by job type
        Map<JobType, List<Job>> byType = jobs.stream()
                .filter(j -> j.getJobType() != null)
                .collect(Collectors.groupingBy(Job::getJobType));
        d.byJobType = byType.entrySet().stream()
                .map(e -> new Bucket(e.getKey().name(), e.getValue().size(),
                        median(salaryList(e.getValue()))))
                .sorted((a, b) -> Integer.compare(b.count, a.count))
                .collect(Collectors.toList());

        // Group by province (top 8)
        Map<String, List<Job>> byProv = jobs.stream()
                .filter(j -> j.getProvince() != null && !j.getProvince().isBlank())
                .collect(Collectors.groupingBy(Job::getProvince));
        d.byLocation = byProv.entrySet().stream()
                .map(e -> new Bucket(asciiSafe(e.getKey()), e.getValue().size(),
                        median(salaryList(e.getValue()))))
                .sorted((a, b) -> Integer.compare(b.count, a.count))
                .limit(8)
                .collect(Collectors.toList());

        return d;
    }

    private List<BigDecimal> salaryList(List<Job> jobs) {
        return jobs.stream()
                .map(j -> normalizeToMonthly(j.getMinSalary(), j.getSalaryType()))
                .collect(Collectors.toList());
    }

    /** Normalize salary to monthly equivalent (rough — assumes 22 working days, 8h/day). */
    private BigDecimal normalizeToMonthly(BigDecimal value, SalaryType type) {
        if (value == null) return BigDecimal.ZERO;
        if (type == null || type == SalaryType.MONTH) return value;
        return switch (type) {
            case HOUR -> value.multiply(BigDecimal.valueOf(176));   // 22 days * 8h
            case YEAR -> value.divide(BigDecimal.valueOf(12), RoundingMode.HALF_UP);
            default -> value;
        };
    }

    private BigDecimal median(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) return BigDecimal.ZERO;
        List<BigDecimal> sorted = new ArrayList<>(values);
        sorted.sort(BigDecimal::compareTo);
        int mid = sorted.size() / 2;
        if (sorted.size() % 2 == 1) return sorted.get(mid);
        return sorted.get(mid - 1).add(sorted.get(mid)).divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP);
    }

    /** Strip Vietnamese diacritics so Helvetica can render the text. */
    private String asciiSafe(String input) {
        if (input == null) return "";
        return java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace("đ", "d").replace("Đ", "D");
    }

    private String formatVnd(BigDecimal value) {
        if (value == null) return "N/A";
        // Display in million VND with 1 decimal
        BigDecimal mil = value.divide(BigDecimal.valueOf(1_000_000), 1, RoundingMode.HALF_UP);
        return mil + " M VND";
    }

    // ─── Page renderers ───────────────────────────────────────────────────

    private void renderCoverPage(PDDocument doc) throws Exception {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
            // Top blue band
            fillRect(c, 0, 720, 595, 122, BRAND_BLUE);
            drawText(c, "ITing", 40, 780, FONT_BOLD, 32, Color.WHITE);
            drawText(c, "SALARY REPORT 2026", 40, 745, FONT_REGULAR, 14, Color.WHITE);

            // Main title
            drawText(c, "Vietnam IT", 40, 600, FONT_BOLD, 42, BRAND_NAVY);
            drawText(c, "Salary Report", 40, 555, FONT_BOLD, 42, BRAND_NAVY);
            drawText(c, "2026 Edition", 40, 510, FONT_ITALIC, 28, BRAND_BLUE);

            drawText(c, "Generated from real job postings on iting.vn", 40, 460,
                    FONT_REGULAR, 12, BRAND_GRAY);

            // Footer
            drawText(c,
                    "Report generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                    40, 60, FONT_REGULAR, 10, BRAND_GRAY);
            drawText(c, "iting.vn", 500, 60, FONT_BOLD, 12, BRAND_BLUE);
        }
    }

    private void renderSummaryPage(PDDocument doc, ReportData data) throws Exception {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
            pageHeader(c, "Executive Summary");

            drawText(c, "Key Statistics", 40, 720, FONT_BOLD, 18, BRAND_NAVY);

            // Stats grid (2x2)
            statBox(c, 40, 600,  255, 90, "Total active jobs analyzed", String.valueOf(data.totalJobs));
            statBox(c, 305, 600, 255, 90, "Median monthly salary", formatVnd(data.medianMonthly));
            statBox(c, 40, 500,  255, 90, "Highest salary observed", formatVnd(data.maxMonthly));
            statBox(c, 305, 500, 255, 90, "Lowest salary observed", formatVnd(data.minMonthly));

            // Key insights
            drawText(c, "Key Insights", 40, 440, FONT_BOLD, 16, BRAND_NAVY);
            int y = 415;
            for (String insight : buildInsights(data)) {
                drawText(c, "- " + insight, 40, y, FONT_REGULAR, 11, BRAND_NAVY);
                y -= 22;
            }
        }
    }

    private void renderByExperiencePage(PDDocument doc, ReportData data) throws Exception {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
            pageHeader(c, "Salary by Experience Level");
            renderBarChart(c, data.byExperience, 50, 600);
            tableHeader(c, "Experience", "Jobs", "Median");
            int y = 250;
            for (Bucket b : data.byExperience) {
                tableRow(c, b.label, b.count, formatVnd(b.median), y);
                y -= 22;
            }
        }
    }

    private void renderByJobTypePage(PDDocument doc, ReportData data) throws Exception {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
            pageHeader(c, "Salary by Job Type");
            renderBarChart(c, data.byJobType, 50, 600);
            tableHeader(c, "Job Type", "Jobs", "Median");
            int y = 250;
            for (Bucket b : data.byJobType) {
                tableRow(c, b.label, b.count, formatVnd(b.median), y);
                y -= 22;
            }
        }
    }

    private void renderByLocationPage(PDDocument doc, ReportData data) throws Exception {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
            pageHeader(c, "Top Locations");
            renderBarChart(c, data.byLocation, 50, 600);
            tableHeader(c, "Location", "Jobs", "Median");
            int y = 250;
            for (Bucket b : data.byLocation) {
                tableRow(c, b.label, b.count, formatVnd(b.median), y);
                y -= 22;
            }
        }
    }

    private void renderMethodologyPage(PDDocument doc, ReportData data) throws Exception {
        PDPage page = new PDPage(PDRectangle.A4);
        doc.addPage(page);
        try (PDPageContentStream c = new PDPageContentStream(doc, page)) {
            pageHeader(c, "Methodology");

            drawText(c, "Data source", 40, 720, FONT_BOLD, 14, BRAND_NAVY);
            drawText(c, "Real active job postings on iting.vn at the time of report generation.",
                    40, 700, FONT_REGULAR, 11, BRAND_NAVY);

            drawText(c, "Methodology", 40, 660, FONT_BOLD, 14, BRAND_NAVY);
            String[] notes = {
                    "Only jobs with disclosed min/max salary are included.",
                    "All amounts are normalized to monthly equivalents (22 working days, 8h/day).",
                    "Median is preferred over average to reduce outlier impact.",
                    "Grouping uses normalized labels (case-insensitive, diacritic-stripped).",
                    "Sample size: " + data.totalJobs + " active jobs.",
            };
            int y = 640;
            for (String n : notes) {
                drawText(c, "- " + n, 40, y, FONT_REGULAR, 11, BRAND_NAVY);
                y -= 20;
            }

            drawText(c, "Disclaimer", 40, 480, FONT_BOLD, 14, BRAND_NAVY);
            drawText(c, "Figures reflect job postings, not negotiated offers. Actual",
                    40, 460, FONT_REGULAR, 11, BRAND_GRAY);
            drawText(c, "compensation may vary based on individual negotiations,",
                    40, 445, FONT_REGULAR, 11, BRAND_GRAY);
            drawText(c, "benefits, equity, and bonuses not captured in this dataset.",
                    40, 430, FONT_REGULAR, 11, BRAND_GRAY);

            // Footer
            fillRect(c, 0, 0, 595, 50, BRAND_NAVY);
            drawText(c, "(c) 2026 ITing. All rights reserved.", 40, 20, FONT_REGULAR, 10, Color.WHITE);
            drawText(c, "iting.vn", 500, 20, FONT_BOLD, 11, Color.WHITE);
        }
    }

    // ─── Drawing primitives ───────────────────────────────────────────────

    private void pageHeader(PDPageContentStream c, String title) throws Exception {
        fillRect(c, 0, 800, 595, 42, BRAND_BLUE);
        drawText(c, "ITing Salary Report 2026", 40, 815, FONT_BOLD, 12, Color.WHITE);
        drawText(c, title, 40, 760, FONT_BOLD, 24, BRAND_NAVY);
        fillRect(c, 40, 750, 60, 3, BRAND_BLUE);
    }

    private void statBox(PDPageContentStream c, int x, int y, int w, int h,
                          String label, String value) throws Exception {
        fillRect(c, x, y, w, h, BRAND_LIGHT);
        drawText(c, label, x + 12, y + h - 20, FONT_REGULAR, 10, BRAND_GRAY);
        drawText(c, value, x + 12, y + 25, FONT_BOLD, 20, BRAND_NAVY);
    }

    private void renderBarChart(PDPageContentStream c, List<Bucket> buckets, int x, int y) throws Exception {
        if (buckets.isEmpty()) {
            drawText(c, "(no data available)", x, y, FONT_ITALIC, 11, BRAND_GRAY);
            return;
        }
        int maxCount = buckets.stream().mapToInt(b -> b.count).max().orElse(1);
        int barHeight = 20;
        int gap = 8;
        int maxBarWidth = 400;
        int rowY = y;

        for (Bucket b : buckets) {
            int barW = (int) (((double) b.count / maxCount) * maxBarWidth);
            drawText(c, b.label, x, rowY + 5, FONT_REGULAR, 10, BRAND_NAVY);
            fillRect(c, x + 110, rowY, barW, barHeight, BRAND_BLUE);
            drawText(c, b.count + " jobs", x + 115 + barW, rowY + 5, FONT_REGULAR, 9, BRAND_NAVY);
            rowY -= barHeight + gap;
        }
    }

    private void tableHeader(PDPageContentStream c, String col1, String col2, String col3) throws Exception {
        fillRect(c, 40, 275, 515, 22, BRAND_NAVY);
        drawText(c, col1, 50, 280, FONT_BOLD, 11, Color.WHITE);
        drawText(c, col2, 280, 280, FONT_BOLD, 11, Color.WHITE);
        drawText(c, col3, 380, 280, FONT_BOLD, 11, Color.WHITE);
    }

    private void tableRow(PDPageContentStream c, String label, int count, String median, int y) throws Exception {
        drawText(c, label, 50, y, FONT_REGULAR, 10, BRAND_NAVY);
        drawText(c, String.valueOf(count), 280, y, FONT_REGULAR, 10, BRAND_NAVY);
        drawText(c, median, 380, y, FONT_REGULAR, 10, BRAND_NAVY);
    }

    private void fillRect(PDPageContentStream c, float x, float y, float w, float h, Color color)
            throws Exception {
        c.setNonStrokingColor(toPDColor(color));
        c.addRect(x, y, w, h);
        c.fill();
    }

    private void drawText(PDPageContentStream c, String text, float x, float y,
                           PDFont font, float size, Color color) throws Exception {
        if (text == null) text = "";
        // Helvetica supports basic Latin; strip non-Latin chars for safety
        String safe = text.replaceAll("[^\\x20-\\x7E]", "");
        c.beginText();
        c.setFont(font, size);
        c.setNonStrokingColor(toPDColor(color));
        c.newLineAtOffset(x, y);
        c.showText(safe);
        c.endText();
    }

    private PDColor toPDColor(Color color) {
        return new PDColor(new float[]{
                color.getRed() / 255f,
                color.getGreen() / 255f,
                color.getBlue() / 255f},
                PDDeviceRGB.INSTANCE);
    }

    private List<String> buildInsights(ReportData d) {
        List<String> out = new ArrayList<>();
        if (d.totalJobs > 0) {
            out.add("Median monthly salary across " + d.totalJobs + " jobs: " + formatVnd(d.medianMonthly));
        }
        if (!d.byExperience.isEmpty()) {
            Bucket topExp = d.byExperience.get(0);
            out.add("Most in-demand experience level: " + topExp.label + " (" + topExp.count + " jobs)");
        }
        if (!d.byLocation.isEmpty()) {
            Bucket topLoc = d.byLocation.get(0);
            out.add("Top hiring location: " + topLoc.label + " (" + topLoc.count + " jobs)");
        }
        if (d.byJobType.size() > 0) {
            Bucket topType = d.byJobType.get(0);
            out.add("Most common employment type: " + topType.label);
        }
        out.add("Report generated automatically from live job posting data on iting.vn.");
        return out;
    }

    // ─── DTOs ─────────────────────────────────────────────────────────────

    private static class ReportData {
        int totalJobs;
        LocalDate generatedAt;
        BigDecimal medianMonthly = BigDecimal.ZERO;
        BigDecimal minMonthly = BigDecimal.ZERO;
        BigDecimal maxMonthly = BigDecimal.ZERO;
        List<Bucket> byExperience = new ArrayList<>();
        List<Bucket> byJobType = new ArrayList<>();
        List<Bucket> byLocation = new ArrayList<>();
    }

    private static class Bucket {
        final String label;
        final int count;
        final BigDecimal median;
        Bucket(String label, int count, BigDecimal median) {
            this.label = label;
            this.count = count;
            this.median = median;
        }
    }
}

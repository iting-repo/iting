package com.iting.jobportal.common.controller;

import com.iting.jobportal.common.entity.NewsletterSubscription;
import com.iting.jobportal.common.repository.NewsletterSubscriptionRepository;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.common.service.SalaryReportPdfService;
import com.iting.jobportal.file.FileUploadService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Public newsletter signup endpoint — no auth required.
 *
 * <p>POST /api/public/newsletter/subscribe — create subscription
 * <p>GET  /api/public/newsletter/unsubscribe?token=xxx — opt-out via emailed link
 */
@RestController
@RequestMapping("/api/public/newsletter")
@RequiredArgsConstructor
@Slf4j
public class NewsletterController {

    private static final Pattern EMAIL_REGEX = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final String BASE_URL = "https://iting.vn";

    private final NewsletterSubscriptionRepository repository;
    private final EmailService emailService;
    private final FileUploadService fileUploadService;
    private final SalaryReportPdfService salaryReportPdfService;

    /** Presigned URL validity (in minutes) — 7 days. */
    private static final int LEAD_MAGNET_URL_MINUTES = 7 * 24 * 60;

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String email = body.get("email");
        if (email == null || !EMAIL_REGEX.matcher(email.trim()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        }
        email = email.trim().toLowerCase();

        var existing = repository.findByEmail(email);
        if (existing.isPresent()) {
            // Re-activate if previously unsubscribed
            NewsletterSubscription sub = existing.get();
            if (sub.getUnsubscribedAt() != null) {
                sub.setUnsubscribedAt(null);
                sub.setSubscribedAt(LocalDateTime.now());
                repository.save(sub);
            }
            return ResponseEntity.ok(Map.of(
                    "message", "Bạn đã đăng ký nhận newsletter trước đó. Cảm ơn!",
                    "alreadySubscribed", true
            ));
        }

        NewsletterSubscription sub = NewsletterSubscription.builder()
                .email(email)
                .source(body.getOrDefault("source", "FOOTER"))
                .leadMagnet(body.get("leadMagnet"))
                .unsubscribeToken(UUID.randomUUID().toString().replace("-", ""))
                .utmSource(body.get("utmSource"))
                .utmMedium(body.get("utmMedium"))
                .utmCampaign(body.get("utmCampaign"))
                .ipAddress(extractIp(request))
                .build();

        repository.save(sub);

        // ── Send confirmation email (with lead magnet download link if applicable) ──
        try {
            sendWelcomeEmail(sub);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", email, e.getMessage());
            // Don't fail the request — subscription is still recorded
        }

        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công! Email xác nhận đã được gửi.",
                "alreadySubscribed", false
        ));
    }

    /** Send welcome email with optional lead magnet download link. */
    private void sendWelcomeEmail(NewsletterSubscription sub) {
        String unsubscribeUrl = BASE_URL + "/unsubscribe?token=" + sub.getUnsubscribeToken();

        String subject;
        StringBuilder body = new StringBuilder();
        body.append("Chào bạn,\n\n");

        // Branch by lead magnet
        if ("salary-report-2026".equals(sub.getLeadMagnet())) {
            subject = "[ITing] Báo cáo lương IT 2026 — Link download bên trong";
            body.append("Cảm ơn bạn đã quan tâm đến Báo cáo lương IT Việt Nam 2026!\n\n");
            body.append("📥 LINK DOWNLOAD PDF (valid trong 7 ngày):\n");
            body.append(buildSignedDownloadUrl()).append("\n\n");
            body.append("Bạn sẽ tìm thấy trong báo cáo:\n");
            body.append("• 15 vị trí IT phổ biến + mức lương median/P25/P75/P90\n");
            body.append("• So sánh lương 5 thành phố lớn\n");
            body.append("• Top 20 skill có premium 2026\n");
            body.append("• Phân tích VN vs Foreign company\n\n");
            body.append("Mỗi tuần ITing sẽ gửi cho bạn 10 việc làm IT hot nhất phù hợp với thị trường.\n\n");
        } else {
            subject = "[ITing] Cảm ơn bạn đã đăng ký newsletter!";
            body.append("Cảm ơn bạn đã đăng ký nhận newsletter từ ITing.\n\n");
            body.append("Mỗi tuần chúng tôi sẽ gửi cho bạn 10 việc làm IT cao cấp nhất Việt Nam, ")
                .append("cùng phân tích thị trường tuyển dụng và career advice.\n\n");
            body.append("Khám phá ngay 1000+ việc làm IT đang tuyển:\n");
            body.append(BASE_URL).append("/jobs\n\n");
        }

        body.append("---\n");
        body.append("Bạn nhận được email này vì đã đăng ký newsletter trên ITing.\n");
        body.append("Hủy đăng ký: ").append(unsubscribeUrl).append("\n");
        body.append("\nTrân trọng,\nĐội ngũ ITing.");

        emailService.sendEmail(sub.getEmail(), subject, body.toString());

        // Update last_sent_at
        sub.setLastSentAt(java.time.LocalDateTime.now());
        repository.save(sub);
    }

    @GetMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestParam String token) {
        NewsletterSubscription sub = repository.findByUnsubscribeToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Link không hợp lệ hoặc đã hết hạn"));

        if (sub.getUnsubscribedAt() == null) {
            sub.setUnsubscribedAt(LocalDateTime.now());
            repository.save(sub);
        }
        return ResponseEntity.ok(Map.of(
                "message", "Bạn đã hủy đăng ký nhận newsletter từ ITing. Hẹn gặp lại!"
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(Map.of(
                "activeSubscribers", repository.countByUnsubscribedAtIsNull(),
                "total", repository.count()
        ));
    }

    /**
     * Build a signed S3 download URL for the salary report PDF (valid 7 days).
     * Falls back to public URL if presigning fails (e.g., S3 not configured in dev).
     */
    private String buildSignedDownloadUrl() {
        String publicUrl = salaryReportPdfService.getCachedPublicUrl(BASE_URL);
        try {
            return fileUploadService.generatePresignedUrl(publicUrl, LEAD_MAGNET_URL_MINUTES);
        } catch (Exception e) {
            log.warn("Failed to generate signed URL for salary report — fallback to public URL: {}",
                    e.getMessage());
            return publicUrl;
        }
    }

    private String extractIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        if (ip != null && ip.contains(",")) ip = ip.split(",")[0].trim();
        return ip;
    }
}

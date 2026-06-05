package com.iting.jobportal.userprofile.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.S3Service;
import com.iting.jobportal.userprofile.dto.response.CvScoreResponse;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.repository.CVRepository;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service chấm điểm CV tách biệt: đọc trực tiếp PDF từ S3 và gửi tới Gemini 2.5 Flash
 * dưới dạng multimodal input (PDF bytes + prompt).
 *
 * Ưu điểm so với {@link CvScoringServiceImpl} cũ:
 * - Đánh giá được cả CONTENT lẫn LAYOUT (ATS compatibility, visual hierarchy, format consistency).
 * - Phân tích đầy đủ 7 sections: career objectives, work experience, projects,
 *   education, skills, certifications, languages — thay vì chỉ 3 sections từ HF extraction.
 * - 1 request duy nhất tới Gemini → tiết kiệm cost + latency (multimodal).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CVScoringWithPdfService {

    private final CVRepository cvRepository;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    /**
     * Chấm điểm CV bằng cách gửi PDF trực tiếp tới Gemini 2.5 Flash.
     *
     * @param userId ID user (cho ownership check)
     * @param cvId    ID CV cần chấm
     * @param language ngôn ngữ output ("vi" hoặc "en")
     * @return CvScoreResponse hoặc null nếu CV không có file PDF
     */
    public CvScoreResponse scoreCvWithPdf(Long userId, Long cvId, String language) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CV không tồn tại"));
        if (cv.getProfile() == null || !userId.equals(cv.getProfile().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CV không thuộc về bạn");
        }

        // Lấy key từ s3Key hoặc extract từ fileUrl
        String s3Key = (cv.getS3Key() != null && !cv.getS3Key().isBlank())
                ? cv.getS3Key()
                : extractS3KeyFromUrl(cv.getFileUrl());

        if (s3Key == null || s3Key.isBlank()) {
            log.warn("CV id={} không có s3Key, không thể đọc PDF", cvId);
            return null;
        }

        // Đọc PDF bytes từ S3
        byte[] pdfBytes;
        try {
            pdfBytes = s3Service.downloadFile(s3Key);
        } catch (Exception e) {
            log.error("Failed to download CV pdf for cvId={}, s3Key={}: {}", cvId, s3Key, e.getMessage());
            throw new RuntimeException("Failed to read CV file: " + e.getMessage(), e);
        }

        if (pdfBytes == null || pdfBytes.length == 0) {
            log.warn("CV id={} có s3Key nhưng file rỗng", cvId);
            return null;
        }

        // Detect MIME type
        String mimeType = detectMimeType(pdfBytes, cv.getFileName());
        if (mimeType == null) {
            log.warn("CV id={} có MIME không được hỗ trợ (fileName={})", cvId, cv.getFileName());
            return null;
        }

        // Encode base64
        String base64Data = Base64.getEncoder().encodeToString(pdfBytes);

        // Build prompt
        String prompt = buildScoringPrompt(language);

        // Build multipart payload: text prompt + inline_data (PDF)
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> inlinePart = Map.of(
                "inline_data", Map.of(
                        "mime_type", mimeType,
                        "data", base64Data
                )
        );
        Map<String, Object> content = Map.of("parts", List.of(textPart, inlinePart));

        Map<String, Object> payload = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.2,
                        "maxOutputTokens", 8192
                )
        );

        // Gọi Gemini
        CvScoreResponse result = callGeminiMultimodal(payload, language);
        if (result != null) {
            result.setCvId(cvId);
            persist(cv, result);
        }
        return result;
    }

    private void persist(CV cv, CvScoreResponse result) {
        try {
            cv.setOverallScore(result.getOverallScore());
            cv.setScoreJson(objectMapper.writeValueAsString(result));
            cv.setScoredAt(java.time.LocalDateTime.now());
            cvRepository.save(cv);
            log.info("Persisted multimodal score {} for cvId={}", result.getOverallScore(), cv.getId());
        } catch (Exception e) {
            log.warn("Failed to persist score for cvId={}: {}", cv.getId(), e.getMessage());
        }
    }

    /**
     * Gọi Gemini API với multipart payload (text + file).
     * Sử dụng Java 11+ HttpClient thay vì RestTemplate để kiểm soát tốt hơn.
     */
    private CvScoreResponse callGeminiMultimodal(Map<String, Object> payload, String language) {
        String url = geminiApiUrl + "?key=" + geminiApiKey;
        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize Gemini payload: " + e.getMessage(), e);
        }

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(45))  // PDF parsing lâu hơn text-only
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        int maxAttempts = 2;
        long backoffMs = 800;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                String body = response.body();

                if (response.statusCode() == 200) {
                    return parseGeminiResponse(body, language);
                } else if (response.statusCode() >= 500) {
                    lastException = new RuntimeException("Gemini " + response.statusCode() + ": " + body);
                    log.warn("Gemini scoring 5xx attempt {}/{}: HTTP {}", attempt, maxAttempts, response.statusCode());
                } else {
                    // 4xx — fail ngay (bad request, auth, etc.)
                    log.error("Gemini scoring non-retryable HTTP {}: {}", response.statusCode(), body);
                    throw new RuntimeException("Gemini rejected request: HTTP " + response.statusCode() + " - " + body);
                }
            } catch (java.net.http.HttpTimeoutException e) {
                lastException = e;
                log.warn("Gemini scoring timeout attempt {}/{}", attempt, maxAttempts);
            } catch (IOException | InterruptedException e) {
                if (e instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("AI scoring interrupted", e);
                }
                lastException = e;
                log.warn("Gemini scoring IO attempt {}/{}: {}", attempt, maxAttempts, e.getMessage());
            }

            if (attempt < maxAttempts) {
                try {
                    Thread.sleep(backoffMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("AI scoring interrupted", ie);
                }
                backoffMs *= 2;
            }
        }

        throw new RuntimeException("AI service temporarily unavailable, please retry", lastException);
    }

    private CvScoreResponse parseGeminiResponse(String body, String language) {
        try {
            JsonNode root = objectMapper.readTree(body);

            if (root.has("error")) {
                int code = root.path("error").path("code").asInt(500);
                String errMsg = root.path("error").path("message").asText("Unknown error");
                throw new RuntimeException("Gemini API error " + code + ": " + errMsg);
            }

            String text = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            String cleaned = extractJsonFromText(text);
            if (cleaned == null) {
                throw new RuntimeException("Failed to parse Gemini scoring JSON: no JSON object found in response");
            }

            JsonNode node = objectMapper.readTree(cleaned);
            return parseScoringResponse(node, language);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse Gemini scoring JSON: " + e.getMessage(), e);
        }
    }

    private CvScoreResponse parseScoringResponse(JsonNode node, String language) {
        CvScoreResponse.CvScoreResponseBuilder builder = CvScoreResponse.builder()
                .overallScore(node.path("overall_score").asInt(0))
                .scoredAt(java.time.LocalDateTime.now());

        JsonNode breakdown = node.path("score_breakdown");
        if (breakdown.isObject()) {
            CvScoreResponse.ScoreBreakdown.ScoreBreakdownBuilder bd = CvScoreResponse.ScoreBreakdown.builder();
            bd.formatAndReadability(parseDimension(breakdown.path("format_and_readability")));
            bd.contentQuality(parseDimension(breakdown.path("content_quality")));
            bd.skillAlignment(parseDimension(breakdown.path("skill_alignment")));
            bd.experienceNarrative(parseDimension(breakdown.path("experience_narrative")));
            bd.atsCompatibility(parseDimension(breakdown.path("ats_compatibility")));
            builder.scoreBreakdown(bd.build());
        }

        builder.strengths(stringList(node.path("strengths")));
        builder.improvementAreas(stringList(node.path("improvement_areas")));
        builder.criticalIssues(stringList(node.path("critical_issues")));
        builder.recommendations(stringList(node.path("recommendations")));
        builder.evaluationSummary(node.path("evaluation_summary").asText(""));

        return builder.build();
    }

    private CvScoreResponse.DimensionScore parseDimension(JsonNode node) {
        return CvScoreResponse.DimensionScore.builder()
                .score(node.path("score").asInt(0))
                .feedback(node.path("feedback").asText(""))
                .build();
    }

    private List<String> stringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(n -> list.add(n.asText()));
        }
        return list;
    }

    /**
     * Build prompt yêu cầu Gemini phân tích TOÀN DIỆN CV dựa trên PDF (cả content lẫn layout).
     * Prompt được thiết kế để khai thác khả năng multimodal của Gemini 2.5 Flash.
     */
    private String buildScoringPrompt(String language) {
        boolean isVi = !"en".equalsIgnoreCase(language);

        if (isVi) {
            return """
Bạn là một chuyên gia nhân sự cao cấp, chuyên đánh giá chất lượng CV một cách TOÀN DIỆN — cả nội dung lẫn bố cục trực quan.

Đánh giá CV được đính kèm dưới dạng file PDF. Bạn có thể ĐỌC TRỰC TIẾP nội dung và QUAN SÁT bố cục, font chữ, khoảng cách, căn lề, màu sắc, hierarchy của các section.

TUYỆT ĐỐI KHÔNG suy đoán về tuổi tác, giới tính, quốc tịch, tôn giáo, hay bất kỳ đặc điểm được bảo vệ nào. Chỉ đánh giá dựa trên năng lực nghề nghiệp và chất lượng trình bày.

═════════════════════════════════════════
PHẠM VI ĐÁNH GIÁ — phân tích ĐẦY ĐỦ 7 sections
═════════════════════════════════════════

Đọc và phân tích TOÀN BỘ các phần sau (nếu có trong CV):

1. **HEADER / THÔNG TIN CÁ NHÂN**: Họ tên, vị trí ứng tuyển, số điện thoại, email, LinkedIn, GitHub, địa điểm, ảnh đại diện. Đánh giá sự chuyên nghiệp và đầy đủ.

2. **CAREER OBJECTIVES / MỤC TIÊU NGHỀ NGHIỆP**: Định hướng rõ ràng, ngành nghề, vị trí mong muốn, giá trị mang lại.

3. **WORK EXPERIENCE / KINH NGHIỆM LÀM VIỆC**: Vị trí, công ty, thời gian, mô tả công việc, thành tích cụ thể (số liệu đo lường được), công nghệ sử dụng. Có dùng phương pháp STAR (Situation, Task, Action, Result) không?

4. **PROJECTS / DỰ ÁN**: Tên dự án, mô tả, công nghệ, vai trò cá nhân, link GitHub/demo. Đánh giá mức độ phức tạp và tính thực tế.

5. **EDUCATION / HỌC VẤN**: Trường, ngành, thời gian, GPA (nếu có), coursework liên quan, hoạt động ngoại khóa.

6. **SKILLS / KỸ NĂNG**: Technical skills, soft skills, công cụ, frameworks, ngôn ngữ lập trình. Có nhóm hợp lý không, có mô tả mức độ thành thạo không.

7. **CERTIFICATIONS / CHỨNG CHỈ**: Tên chứng chỉ, tổ chức cấp, ngày cấp, điểm số (nếu có). Có liên quan đến ngành không.

8. **LANGUAGES / NGOẠI NGỮ**: Tiếng Anh, tiếng Nhật, etc. Có chứng chỉ TOEIC/IELTS không? Mức độ thành thạo.

═════════════════════════════════════════
5 TIÊU CHÍ CHẤM ĐIỂM (mỗi cái 0-100)
═════════════════════════════════════════

**format_and_readability** — Bố cục trực quan:
- Cấu trúc CV có logic, dễ scan không?
- Font chữ nhất quán, dễ đọc, kích thước hợp lý?
- Khoảng cách giữa các section, căn lề, alignment có chuyên nghiệp không?
- Có dùng heading/bold/italic phân cấp thông tin rõ ràng không?
- Có quá nhiều màu sắc hoặc quá ít visual hierarchy không?
- Ảnh đại diện (nếu có) có phù hợp không?

**content_quality** — Chất lượng nội dung:
- Mô tả kinh nghiệm có thành tích đo lường được không (số liệu %, $, số user, tốc độ)?
- Có tránh được mô tả công việc chung chung ("responsible for X") không?
- Projects có giải thích được vấn đề giải quyết + impact không?
- Có thông tin redundant hoặc filler không?
- Có typo/ngữ pháp không?

**skill_alignment** — Phù hợp kỹ năng:
- Skills có khớp với work experience/projects không? (không liệt kê skill không dùng)
- Có nhóm rõ ràng (Languages, Frameworks, Tools) không?
- Có chỉ rõ mức độ (Beginner/Intermediate/Expert) hoặc số năm kinh nghiệm không?
- Skills có industry keywords phù hợp với vị trí ứng tuyển không?
- Có quá ít hoặc quá nhiều skills (dàn trải, thiếu focus) không?

**experience_narrative** — Câu chuyện nghề nghiệp:
- Có progression rõ ràng (Junior → Mid → Senior) không?
- Mỗi role có scope (quy mô team, dự án, budget) rõ không?
- Có gap dài giữa các job không? Có giải thích không?
- Có show được domain expertise qua multiple roles không?
- Career objectives có khớp với quỹ đạo career không?

**ats_compatibility** — Tương thích ATS (Applicant Tracking System):
- Có dùng standard section headers (Education, Experience, Skills) không?
- Có bảng, ảnh phức tạp, infographic gây khó parse không?
- Có contact info rõ ràng ở đầu CV không?
- Có dùng font chuẩn (Arial/Calibri/Times) không?
- Keywords có match với job description tiềm năng không?
- Có dùng abbreviations không giải thích (vd "K8s" mà không có "Kubernetes" ở đâu)?

═════════════════════════════════════════
OUTPUT FORMAT — CHÍNH XÁC JSON sau
═════════════════════════════════════════

Trả về ĐÚNG MỘT đối tượng JSON với cấu trúc chính xác (không markdown, không code fences):

{
  "overall_score": <số nguyên 0-100, trung bình có trọng số của 5 tiêu chí>,
  "score_breakdown": {
    "format_and_readability": { "score": <0-100>, "feedback": "<2-3 câu giải thích cụ thể, vd 'CV có 2 cột rõ ràng nhưng font hơi nhỏ ở phần skills'>" },
    "content_quality": { "score": <0-100>, "feedback": "<2-3 câu>" },
    "skill_alignment": { "score": <0-100>, "feedback": "<2-3 câu>" },
    "experience_narrative": { "score": <0-100>, "feedback": "<2-3 câu>" },
    "ats_compatibility": { "score": <0-100>, "feedback": "<2-3 câu>" }
  },
  "strengths": ["<điểm mạnh cụ thể 1>", "<điểm mạnh 2>", ...],
  "improvement_areas": ["<cải thiện cụ thể 1>", ...],
  "critical_issues": ["<vấn đề nghiêm trọng nếu có, vd 'CV không có phần kinh nghiệm làm việc'>", ...],
  "recommendations": ["<khuyến nghị actionable 1>", "<khuyến nghị 2>", ...],
  "evaluation_summary": "<đoạn tổng kết 3-5 câu, tổng quan về chất lượng CV>"
}

═════════════════════════════════════════
NGUYÊN TẮC CHẤM ĐIỂM
═════════════════════════════════════════

- 80-100: Xuất sắc — CV cạnh tranh cao, ATS-friendly, nội dung có impact đo lường được
- 60-79: Khá — nền tảng vững nhưng cần cải thiện ở một số tiêu chí
- 40-59: Trung bình — generic, thiếu cấu trúc hoặc thành tích cụ thể
- 0-39: Yếu — khoảng trống lớn, khó đọc, hoặc vấn đề ATS nghiêm trọng

Hãy đọc PDF đính kèm và đưa ra đánh giá khách quan, chi tiết, actionable.
""";
        }

        // English version
        return """
You are a senior HR expert specializing in COMPREHENSIVE CV evaluation — both content and visual layout.

Evaluate the attached PDF CV. You can DIRECTLY READ the content and OBSERVE the layout, fonts, spacing, alignment, colors, and section hierarchy.

DO NOT make assumptions about age, gender, nationality, religion, or any protected characteristics. Evaluate ONLY based on professional competence and presentation quality.

═════════════════════════════════════════
EVALUATION SCOPE — analyze ALL 7 sections
═════════════════════════════════════════

1. **HEADER / CONTACT INFO**: Name, target position, phone, email, LinkedIn, GitHub, location, photo. Professionalism and completeness.
2. **CAREER OBJECTIVES**: Clear direction, target industry/role, value proposition.
3. **WORK EXPERIENCE**: Position, company, dates, description, measurable achievements, tech stack. Uses STAR method?
4. **PROJECTS**: Name, description, technologies, personal role, GitHub/demo links. Complexity and practicality.
5. **EDUCATION**: School, major, dates, GPA, relevant coursework, extracurriculars.
6. **SKILLS**: Technical, soft, tools, frameworks, languages. Logical grouping, proficiency levels.
7. **CERTIFICATIONS**: Name, issuer, date, scores. Industry relevance.
8. **LANGUAGES**: English, Japanese, etc. TOEIC/IELTS certificates? Proficiency levels.

═════════════════════════════════════════
5 SCORING CRITERIA (each 0-100)
═════════════════════════════════════════

**format_and_readability** — Visual layout: structure, fonts, spacing, alignment, heading hierarchy, color usage, photo appropriateness.

**content_quality** — Content quality: measurable achievements, specific descriptions, project impact, no filler/typos/grammar errors.

**skill_alignment** — Skill fit: matches experience, logical grouping, proficiency levels, industry keywords, focused vs scattered.

**experience_narrative** — Career story: clear progression, scope context, gap explanations, domain expertise, career objective alignment.

**ats_compatibility** — ATS compatibility: standard headers, no complex tables/graphics, clear contact info, standard fonts, keyword matching, explained abbreviations.

═════════════════════════════════════════
OUTPUT FORMAT — EXACTLY this JSON (no markdown, no code fences)
═════════════════════════════════════════

{
  "overall_score": <integer 0-100, weighted average>,
  "score_breakdown": {
    "format_and_readability": { "score": <0-100>, "feedback": "<2-3 sentences, specific, e.g. '2-column layout is clear but skills font is too small'>" },
    "content_quality": { "score": <0-100>, "feedback": "<2-3 sentences>" },
    "skill_alignment": { "score": <0-100>, "feedback": "<2-3 sentences>" },
    "experience_narrative": { "score": <0-100>, "feedback": "<2-3 sentences>" },
    "ats_compatibility": { "score": <0-100>, "feedback": "<2-3 sentences>" }
  },
  "strengths": ["<specific strength 1>", "<strength 2>", ...],
  "improvement_areas": ["<specific improvement 1>", ...],
  "critical_issues": ["<critical issue if any, e.g. 'No work experience section'>", ...],
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", ...],
  "evaluation_summary": "<3-5 sentence overall summary>"
}

═════════════════════════════════════════
SCORING THRESHOLDS
═════════════════════════════════════════

- 80-100: Excellent — highly competitive, ATS-friendly, measurable impact
- 60-79: Good — solid foundation with room for improvement
- 40-59: Average — generic, missing structure or measurable achievements
- 0-39: Poor — major gaps, unreadable, or critical ATS issues

Read the attached PDF and provide objective, detailed, actionable evaluation.
""";
    }

    /**
     * Trích JSON object từ text response. Bỏ qua markdown fences, tìm balanced braces.
     */
    private String extractJsonFromText(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        if (trimmed.isEmpty()) return null;

        if (trimmed.startsWith("```json")) trimmed = trimmed.substring(7);
        else if (trimmed.startsWith("```")) trimmed = trimmed.substring(3);
        if (trimmed.endsWith("```")) trimmed = trimmed.substring(0, trimmed.length() - 3);
        trimmed = trimmed.trim();

        if (trimmed.startsWith("{")) {
            return findBalancedJson(trimmed);
        }

        int firstBrace = trimmed.indexOf('{');
        if (firstBrace < 0) return null;
        return findBalancedJson(trimmed.substring(firstBrace));
    }

    private String findBalancedJson(String s) {
        int depth = 0;
        boolean inString = false;
        boolean escape = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (escape) { escape = false; continue; }
            if (c == '\\') { escape = true; continue; }
            if (c == '"' && !escape) { inString = !inString; continue; }
            if (inString) continue;
            if (c == '{') depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) return s.substring(0, i + 1);
            }
        }
        return null;
    }

    private String detectMimeType(byte[] bytes, String fileName) {
        if (fileName != null) {
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".pdf")) return "application/pdf";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".webp")) return "image/webp";
        }
        // Magic bytes detection
        if (bytes.length >= 4) {
            if (bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F') {
                return "application/pdf";
            }
            if (bytes[0] == (byte) 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G') {
                return "image/png";
            }
            if (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
                return "image/jpeg";
            }
        }
        return null;
    }

    private String extractS3KeyFromUrl(String url) {
        if (url == null || url.isBlank()) return null;
        if (!url.contains("amazonaws.com")) return null;
        try {
            String noQuery = url.split("\\?", 2)[0];
            java.net.URI uri = java.net.URI.create(noQuery);
            String path = uri.getPath();
            if (path == null || path.isBlank()) return null;
            String key = path.startsWith("/") ? path.substring(1) : path;
            if (uri.getHost() != null && uri.getHost().startsWith("s3.") && key.contains("/")) {
                key = key.substring(key.indexOf('/') + 1);
            }
            return key.isBlank() ? null : key;
        } catch (Exception e) {
            return null;
        }
    }
}

package com.iting.jobportal.userprofile.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.userprofile.dto.response.CvScoreResponse;
import com.iting.jobportal.userprofile.dto.response.CvScoreResponse.DimensionScore;
import com.iting.jobportal.userprofile.dto.response.CvScoreResponse.ScoreBreakdown;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.service.CvScoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Stateless LLM-based CV quality scorer.
 *
 * Strategy:
 * 1. Use stored extractedDataJson if available (already parsed by HuggingFace).
 * 2. Fall back to the CV text field if provided directly.
 * 3. Call Gemini with a strict JSON-output prompt and parse the rubric result.
 *
 * Guardrails:
 * - Bias-free: no protected-characteristic inference.
 * - Evidence-based: feedback tied to actual CV content.
 * - Valid JSON enforced via response schema constraints.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CvScoringServiceImpl implements CvScoringService {

    private final CVRepository cvRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.model:gemma-4-31b-it}")
    private String modelName;

    @Override
    public CvScoreResponse scoreCv(Long cvId, String language) {
        return cvRepository.findById(cvId)
                .map(cv -> scoreFromCV(cv, language))
                .orElse(null);
    }

    @Override
    public CvScoreResponse scoreFromText(String cvText, String language) {
        if (cvText == null || cvText.isBlank()) return null;
        return callGeminiWithPrompt(cvText, null, language);
    }

    private CvScoreResponse scoreFromCV(CV cv, String language) {
        String extractedJson = cv.getExtractedDataJson();
        if (extractedJson != null && !extractedJson.isBlank()) {
            try {
                JsonNode node = objectMapper.readTree(extractedJson);
                String reconstructed = reconstructTextFromExtracted(node);
                CvScoreResponse result = callGeminiWithPrompt(reconstructed, cv.getTitle(), language);
                if (result != null) {
                    persist(cv, result);
                }
                return result;
            } catch (Exception e) {
                // extractedDataJson parse fail (CV có format lạ) → fallback raw title.
                // Đây KHÔNG phải lỗi "AI service down" nên chỉ log warn và tiếp tục fallback.
                if (e.getMessage() != null && e.getMessage().contains("AI service temporarily")) {
                    // Lỗi từ Gemini → propagate lên để controller trả 502 thay vì 404.
                    throw e;
                }
                log.warn("Failed to use extractedDataJson for cvId={}, falling back to raw: {}",
                        cv.getId(), e.getMessage());
            }
        }
        CvScoreResponse result = callGeminiWithPrompt(
                cv.getTitle() != null ? cv.getTitle() : "",
                cv.getTitle(),
                language
        );
        if (result != null) {
            persist(cv, result);
        }
        return result;
    }

    private String reconstructTextFromExtracted(JsonNode node) {
        StringBuilder sb = new StringBuilder();
        if (node.has("summary") || node.has("profile")) {
            sb.append(node.path("summary").path("profile").asText()).append(" ");
        }
        if (node.has("skills")) {
            sb.append("Skills: ");
            node.path("skills").forEach(s -> sb.append(s.asText()).append(", "));
            sb.append(" ");
        }
        if (node.has("experiences")) {
            node.path("experiences").forEach(exp -> {
                sb.append("Experience: ")
                        .append(exp.path("position").asText()).append(" at ")
                        .append(exp.path("companyName").asText()).append(". ")
                        .append(exp.path("description").asText()).append(" ");
            });
        }
        if (node.has("education")) {
            node.path("education").forEach(edu -> {
                sb.append("Education: ")
                        .append(edu.path("degree").asText()).append(" at ")
                        .append(edu.path("schoolName").asText()).append(". ");
            });
        }
        return sb.length() > 0 ? sb.toString().trim() : "";
    }

    private void persist(CV cv, CvScoreResponse result) {
        try {
            cv.setOverallScore(result.getOverallScore());
            cv.setScoreJson(objectMapper.writeValueAsString(result));
            cv.setScoredAt(LocalDateTime.now());
            cvRepository.save(cv);
            log.info("Persisted score {} for cvId={}", result.getOverallScore(), cv.getId());
        } catch (Exception e) {
            log.warn("Failed to persist score for cvId={}: {}", cv.getId(), e.getMessage());
        }
    }

    private CvScoreResponse callGeminiWithPrompt(String cvText, String cvTitle, String language) {
        String prompt = buildScoringPrompt(cvText, cvTitle, language);

        // generationConfig ép Gemini chỉ trả về JSON thuần (không kèm giải thích markdown).
        // Giải quyết triệt để lỗi "Unrecognized token 'HR'..." trước đây.
        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.2
                )
        );

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        org.springframework.http.HttpEntity<Map<String, Object>> entity =
                new org.springframework.http.HttpEntity<>(payload, headers);

        String url = geminiApiUrl + "?key=" + geminiApiKey;
        org.springframework.web.client.RestTemplate restTemplate =
                new org.springframework.web.client.RestTemplate();

        // Retry tối đa 3 lần với exponential backoff cho 5xx / IO errors (Google service tạm thời lỗi).
        // Sau 3 lần fail, throw RuntimeException để controller phân biệt "lỗi AI" vs "CV không tồn tại".
        int maxAttempts = 3;
        long backoffMs = 800;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                String raw = restTemplate.postForObject(url, entity, String.class);
                JsonNode root = objectMapper.readTree(raw);

                // Check if Gemini trả error response (5xx wrapped trong body)
                if (root.has("error")) {
                    int code = root.path("error").path("code").asInt(500);
                    if (code >= 500) {
                        throw new org.springframework.web.client.HttpServerErrorException(
                                org.springframework.http.HttpStatus.valueOf(code),
                                "Gemini API error: " + root.path("error").toString());
                    }
                }

                String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

                String cleaned = text.trim();
                if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
                else if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
                if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length() - 3);
                cleaned = cleaned.trim();

                JsonNode node = objectMapper.readTree(cleaned);
                return parseScoringResponse(node);

            } catch (org.springframework.web.client.HttpServerErrorException e) {
                // 5xx → retry với backoff
                lastException = e;
                log.warn("Gemini scoring 5xx attempt {}/{}: {}", attempt, maxAttempts, e.getStatusCode());
            } catch (org.springframework.web.client.ResourceAccessException e) {
                // Network/IO error → retry
                lastException = e;
                log.warn("Gemini scoring IO attempt {}/{}: {}", attempt, maxAttempts, e.getMessage());
            } catch (Exception e) {
                // Parse error hoặc lỗi khác → không retry, fail ngay (thường do prompt hoặc model)
                log.error("Gemini scoring non-retryable error: {}", e.getMessage());
                throw new RuntimeException("AI scoring failed: " + e.getMessage(), e);
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

        log.error("Gemini scoring failed after {} attempts: {}", maxAttempts,
                lastException != null ? lastException.getMessage() : "unknown");
        throw new RuntimeException("AI service temporarily unavailable, please retry", lastException);
    }

    private String buildScoringPrompt(String cvText, String cvTitle, String language) {
        boolean isVietnamese = !"en".equalsIgnoreCase(language);

        if (isVietnamese) {
            return """
Bạn là một chuyên gia nhân sự chuyên đánh giá chất lượng CV.
Hãy đánh giá nội dung CV sau một cách khách quan, chỉ dựa trên các năng lực liên quan đến công việc.
TUYỆT ĐỐI KHÔNG suy đoán về tuổi tác, giới tính, quốc tịch, hay các đặc điểm được bảo vệ.

Trả về ĐÚNG MỘT đối tượng JSON (không có markdown, không có code fences) với cấu trúc chính xác sau:
{
  "overall_score": <số nguyên 0-100>,
  "score_breakdown": {
    "format_and_readability": { "score": <0-100>, "feedback": "<chuỗi>" },
    "content_quality": { "score": <0-100>, "feedback": "<chuỗi>" },
    "skill_alignment": { "score": <0-100>, "feedback": "<chuỗi>" },
    "experience_narrative": { "score": <0-100>, "feedback": "<chuỗi>" },
    "ats_compatibility": { "score": <0-100>, "feedback": "<chuỗi>" }
  },
  "strengths": ["<chuỗi>", ...],
  "improvement_areas": ["<chuỗi>", ...],
  "critical_issues": ["<chuỗi>", ...],
  "recommendations": ["<chuỗi>", ...],
  "evaluation_summary": "<chuỗi>"
}

Ngưỡng chấm điểm:
- 80-100: Xuất sắc — cạnh tranh cao, cấu trúc tốt, nội dung mạnh
- 60-79: Khá — nền tảng vững nhưng cần cải thiện thêm
- 40-59: Trung bình — chung chung, thiếu cấu trúc hoặc thành tích đo lường được
- 0-39: Yếu — khoảng trống lớn, khó đọc, hoặc vấn đề ATS nghiêm trọng

Tiêu chí đánh giá theo từng chiều:
- format_and_readability: bố cục sạch, định dạng nhất quán, font và khoảng cách dễ đọc
- content_quality: câu thành tích có tác động đo lường được, không có mô tả công việc chung chung
- skill_alignment: kỹ năng kỹ thuật và mềm phù hợp, có từ khóa ngành
- experience_narrative: tiến triển sự nghiệp rõ ràng, ngữ cảnh phạm vi công việc, chuyển tiếp hợp lý
- ats_compatibility: tiêu đề phần tiêu chuẩn, không có bảng/đồ họa, giàu từ khóa

NỘI DUNG CV:
%s

TÊN CV (nếu có): %s
""".formatted(cvText.isBlank() ? "(không trích xuất được văn bản — đánh giá dựa trên siêu dữ liệu có sẵn)" : cvText,
                    cvTitle != null ? cvTitle : "N/A");
        } else {
            return """
You are a professional HR consultant evaluating CV quality.
Evaluate the following CV content objectively, focusing only on job-relevant competencies.
Do NOT make assumptions about age, gender, nationality, or other protected characteristics.

Return a single, valid JSON object (no markdown, no code fences) with exactly this structure:
{
  "overall_score": <integer 0-100>,
  "score_breakdown": {
    "format_and_readability": { "score": <0-100>, "feedback": "<string>" },
    "content_quality": { "score": <0-100>, "feedback": "<string>" },
    "skill_alignment": { "score": <0-100>, "feedback": "<string>" },
    "experience_narrative": { "score": <0-100>, "feedback": "<string>" },
    "ats_compatibility": { "score": <0-100>, "feedback": "<string>" }
  },
  "strengths": ["<string>", ...],
  "improvement_areas": ["<string>", ...],
  "critical_issues": ["<string>", ...],
  "recommendations": ["<string>", ...],
  "evaluation_summary": "<string>"
}

Scoring thresholds:
- 80-100: Excellent — highly competitive, well-structured, strong content
- 60-79: Good — solid foundation with room for improvement
- 40-59: Average — generic, missing structure or measurable achievements
- 0-39: Poor — major gaps, unreadable, or critical ATS issues

Evaluation criteria per dimension:
- format_and_readability: clean layout, consistent formatting, readable fonts and spacing
- content_quality: achievement statements with measurable impact, no generic duties
- skill_alignment: relevant technical and soft skills, industry keywords present
- experience_narrative: clear career progression, job scope context, logical transitions
- ats_compatibility: standard section headers, no tables/graphics, keyword-dense

CV CONTENT:
%s

CV TITLE (if available): %s
""".formatted(cvText.isBlank() ? "(no text extracted — evaluate based on available metadata)" : cvText,
                    cvTitle != null ? cvTitle : "N/A");
        }
    }

    private CvScoreResponse parseScoringResponse(JsonNode node) {
        ScoreBreakdown breakdown = ScoreBreakdown.builder()
                .formatAndReadability(parseDimension(node.path("score_breakdown").path("format_and_readability")))
                .contentQuality(parseDimension(node.path("score_breakdown").path("content_quality")))
                .skillAlignment(parseDimension(node.path("score_breakdown").path("skill_alignment")))
                .experienceNarrative(parseDimension(node.path("score_breakdown").path("experience_narrative")))
                .atsCompatibility(parseDimension(node.path("score_breakdown").path("ats_compatibility")))
                .build();

        List<String> strengths = new ArrayList<>();
        node.path("strengths").forEach(n -> strengths.add(n.asText()));

        List<String> improvementAreas = new ArrayList<>();
        node.path("improvement_areas").forEach(n -> improvementAreas.add(n.asText()));

        List<String> criticalIssues = new ArrayList<>();
        node.path("critical_issues").forEach(n -> criticalIssues.add(n.asText()));

        List<String> recommendations = new ArrayList<>();
        node.path("recommendations").forEach(n -> recommendations.add(n.asText()));

        return CvScoreResponse.builder()
                .overallScore(node.path("overall_score").asInt(0))
                .scoreBreakdown(breakdown)
                .strengths(strengths)
                .improvementAreas(improvementAreas)
                .criticalIssues(criticalIssues)
                .recommendations(recommendations)
                .evaluationSummary(node.path("evaluation_summary").asText(""))
                .scoredAt(LocalDateTime.now())
                .build();
    }

    private DimensionScore parseDimension(JsonNode node) {
        return DimensionScore.builder()
                .score(node.path("score").asInt(0))
                .feedback(node.path("feedback").asText(""))
                .build();
    }
}
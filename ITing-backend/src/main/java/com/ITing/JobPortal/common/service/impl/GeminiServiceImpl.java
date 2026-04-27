package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Override
    public String generateContent(String prompt) {
        try {
            String url = apiUrl + "?key=" + apiKey;
            log.info("Calling Gemini API URL: {}", url.replaceAll("key=.*", "key=***"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Cấu trúc request Body cho Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> part = new HashMap<>();
            part.put("parts", Collections.singletonList(textPart));

            requestBody.put("contents", Collections.singletonList(part));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Gemini request body: {}", requestBody);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            log.info("Gemini API Response: {}", response);

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            log.warn("Gemini API returned success but candidates were missing or empty. Response: {}", response);
            return "Không thể nhận phản hồi định dạng đúng từ AI.";
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Gemini API Error (HTTP {}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            return "Lỗi AI (HTTP " + e.getStatusCode() + "): " + e.getResponseBodyAsString();
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini API: ", e);
            return "Lỗi hệ thống khi gọi AI: " + e.getMessage();
        }
    }

    @Override
    public String reviewJob(Job job) {
        String prompt = String.format(
                "Bạn là một chuyên gia kiểm duyệt tin tuyển dụng uy tín. Hãy đánh giá nghiêm ngặt tin tuyển dụng sau đây dựa trên các tiêu chí:\n" +
                "1. **TÍNH HỢP PHÁP & AN TOÀN:** Đặc biệt chú ý các dấu hiệu lừa đảo, đa cấp bất chính, hoặc các hành vi phạm pháp (như cướp bóc, đánh bạc, buôn lậu). Nếu tiêu đề hoặc mô tả có nội dung vi phạm pháp luật, hãy yêu cầu TỪ CHỐI ngay lập tức.\n" +
                "2. **Tính chuyên nghiệp:** Ngôn từ có thô tục, nhạy cảm hay không chuyên nghiệp không.\n" +
                "4. **KẾT LUẬN:** Đưa ra lời khuyên DUYỆT hoặc TỪ CHỐI (ghi rõ lý do cụ thể).\n\n" +
                "**LƯU Ý QUAN TRỌNG:** Ở dòng cuối cùng của câu trả lời, hãy luôn thêm chính xác cú pháp sau để hệ thống tự động xử lý:\n" +
                "FINAL_DECISION: [APPROVE] nếu các tiêu chí đều ổn.\n" +
                "FINAL_DECISION: [REJECT] nếu có bất kỳ dấu hiệu vi phạm hoặc thiếu hụt nghiêm trọng.\n\n" +
                "Dữ liệu cần kiểm tra:\n" +
                "TIÊU ĐỀ: %s\n" +
                "VỊ TRÍ: %s\n" +
                "MÔ TẢ: %s\n" +
                "YÊU CẦU: %s\n" +
                "QUYỀN LỢI: %s\n" +
                "ĐỊA CHỈ: %s\n" +
                "LƯƠNG: %s - %s\n\n" +
                "Hãy trả lời bằng tiếng Việt, ngắn gọn, súc tích, định dạng Markdown.",
                job.getTitle(),
                job.getPosition(),
                job.getDescription(),
                job.getRequirements(),
                job.getBenefits(),
                job.getLocation(),
                job.getMinSalary(),
                job.getMaxSalary()
        );

        return generateContent(prompt);
    }

    @Override
    public List<String> expandSearchTerms(String keyword) {
        if (keyword == null || keyword.isBlank()) return Collections.emptyList();

        String prompt = String.format(
                "Bạn là một chuyên gia trong lĩnh vực tuyển dụng IT. " +
                "Hãy phân tích từ khóa tìm kiếm việc làm sau: \"%s\". " +
                "Hãy liệt kê tối đa 10 từ khóa liên quan nhất, bao gồm:\n" +
                "1. Từ đồng nghĩa (ví dụ: 'lập trình viên' -> 'developer').\n" +
                "2. Các từ paraphrase hoặc cách gọi khác.\n" +
                "3. Các công nghệ liên quan chặt chẽ.\n" +
                "4. Viết tắt phổ biến.\n" +
                "\n" +
                "CHỈ TRẢ VỀ DANH SÁCH CÁC TỪ KHÓA, CÁCH NHAU BỞI DẤU PHẨY. KHÔNG GIẢI THÍCH GÌ THÊM.",
                keyword
        );

        String result = generateContent(prompt);
        if (result == null || result.isBlank() || result.startsWith("Lỗi")) {
            return Collections.singletonList(keyword);
        }

        return java.util.Arrays.stream(result.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }

    @Override
    public JobSearchRequest extractSearchCriteriaFromCv(String cvText) {
        if (cvText == null || cvText.isBlank()) return new JobSearchRequest();

        String prompt = String.format(
                "Bạn là một chuyên gia phân tích CV IT. Hãy đọc nội dung CV sau và trích xuất thông tin tìm kiếm việc làm phù hợp.\n" +
                "Nội dung CV: \"%s\"\n\n" +
                "Hãy trả về kết quả dưới dạng JSON duy nhất với các trường sau:\n" +
                "- keyword: Vị trí công việc mong muốn (ví dụ: 'Java Developer').\n" +
                "- techs: Danh sách các công nghệ/ngôn ngữ lập trình chính (ví dụ: ['Java', 'Spring Boot']).\n" +
                "- experienceLevel: Một trong các giá trị [INTERN, FRESHER, JUNIOR, MIDDLE, SENIOR, LEAD, EXPERT, MANAGER].\n" +
                "- domain: Lĩnh vực chuyên môn (ví dụ: 'Web Development').\n" +
                "\n" +
                "CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH.",
                cvText
        );

        String result = generateContent(prompt);
        log.info("CV Analysis result: {}", result);

        try {
            // Clean markdown json if present
            String json = result.replaceAll("```json", "").replaceAll("```", "").trim();
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> map = mapper.readValue(json, Map.class);

            JobSearchRequest request = new JobSearchRequest();
            request.setKeyword((String) map.get("keyword"));
            request.setTechs((List<String>) map.get("techs"));
            request.setDomain((String) map.get("domain"));
            
            String levelStr = (String) map.get("experienceLevel");
            if (levelStr != null) {
                try {
                    request.setExperienceLevel(com.iting.jobportal.job.entity.enums.ExperienceLevel.valueOf(levelStr.toUpperCase()));
                } catch (Exception ignored) {}
            }
            
            return request;
        } catch (Exception e) {
            log.error("Error parsing CV analysis JSON: {}", e.getMessage());
            JobSearchRequest fallback = new JobSearchRequest();
            fallback.setKeyword("Developer"); // Fallback
            return fallback;
        }
    }
}

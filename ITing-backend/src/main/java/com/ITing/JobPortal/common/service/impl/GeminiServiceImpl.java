package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.common.service.GeminiService;
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
}

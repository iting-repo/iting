package com.iting.jobportal.job.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

/**
 * Đọc file Job Description (PDF/Image/text) và trích xuất thành JSON khớp form Đăng tin để HR
 * tự điền. Mirror {@code GeminiCVParserService} nhưng schema là các trường của tin tuyển dụng.
 */
@Slf4j
@Service
public class GeminiJobParserService {

  @Value("${gemini.api.key}")
  private String geminiApiKey;

  @Value("${gemini.api.url}")
  private String geminiApiUrl;

  private final RestTemplate restTemplate = buildRestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  private static RestTemplate buildRestTemplate() {
    org.springframework.http.client.SimpleClientHttpRequestFactory factory =
        new org.springframework.http.client.SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(10_000);
    factory.setReadTimeout(50_000);
    return new RestTemplate(factory);
  }

  public String parseJobDescription(MultipartFile file) throws Exception {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("File JD không được để trống");
    }

    String mimeType = file.getContentType();
    String jdText = "";
    if (mimeType != null && mimeType.equals("application/pdf")) {
      try (InputStream is = file.getInputStream();
          PDDocument document = PDDocument.load(is)) {
        jdText = new PDFTextStripper().getText(document);
      } catch (Exception e) {
        log.warn("Lỗi đọc PDF JD, sẽ dùng inline_data", e);
      }
    }

    String prompt =
        "Bạn là một chuyên gia tuyển dụng. Hãy đọc nội dung JOB DESCRIPTION (mô tả công việc) sau"
            + " và trích xuất thông tin để điền vào form đăng tin tuyển dụng IT.\n"
            + "Nội dung JD:\n"
            + (jdText.isEmpty() ? "(File đính kèm)" : jdText)
            + "\n\n"
            + "Trả về MỘT CHUỖI JSON DUY NHẤT (không bọc trong markdown ```), bắt đầu bằng { và kết"
            + " thúc bằng }, theo đúng định dạng:\n"
            + "{\n"
            + "\"jobTitle\": \"Tiêu đề tin tuyển dụng\",\n"
            + "\"jobPosition\": [\"Vị trí, vd Backend Developer\"],\n"
            + "\"techStack\": [\"Java\", \"Spring Boot\"],\n"
            + "\"workType\": \"FULL_TIME|PART_TIME|REMOTE|FREELANCE|INTERN\",\n"
            + "\"experienceLevel\": \"INTERN|FRESHER|JUNIOR|MIDDLE|SENIOR|LEAD|MANAGER\",\n"
            + "\"workingDays\": \"MON_TO_FRI|MON_TO_SAT|FLEXIBLE\",\n"
            + "\"cvLanguage\": \"ANY|VIETNAMESE|ENGLISH|BOTH\",\n"
            + "\"quantity\": 1,\n"
            + "\"minSalary\": 0,\n"
            + "\"maxSalary\": 0,\n"
            + "\"salaryType\": \"NEGOTIABLE|MONTH|PROJECT|HOUR\",\n"
            + "\"province\": \"Tỉnh/Thành phố\",\n"
            + "\"address\": \"Địa chỉ làm việc\",\n"
            + "\"description\": \"Mô tả công việc (giữ xuống dòng, có thể dùng markdown gạch đầu"
            + " dòng -)\",\n"
            + "\"responsibilities\": \"Trách nhiệm chính\",\n"
            + "\"requirements\": \"Yêu cầu ứng viên\",\n"
            + "\"benefits\": \"Quyền lợi\"\n"
            + "}\n"
            + "QUY TẮC: minSalary/maxSalary là SỐ NGUYÊN VND/tháng (vd 20000000), 0 nếu không rõ."
            + " salaryType=NEGOTIABLE nếu JD ghi thỏa thuận. Chỉ dùng đúng các giá trị enum liệt kê."
            + " Nếu không xác định được trường nào thì để chuỗi rỗng \"\", mảng rỗng [] hoặc số 0.";

    Map<String, Object> textPart = new HashMap<>();
    textPart.put("text", prompt);

    Map<String, Object> content = new HashMap<>();
    if (jdText.isEmpty()) {
      if (mimeType == null
          || (!mimeType.equals("application/pdf") && !mimeType.startsWith("image/"))) {
        mimeType = "application/pdf";
      }
      Map<String, Object> inlineData = new HashMap<>();
      inlineData.put("mime_type", mimeType);
      inlineData.put("data", Base64.getEncoder().encodeToString(file.getBytes()));
      Map<String, Object> inlineDataPart = new HashMap<>();
      inlineDataPart.put("inline_data", inlineData);
      content.put("parts", List.of(textPart, inlineDataPart));
    } else {
      content.put("parts", List.of(textPart));
    }

    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("contents", List.of(content));
    requestBody.put(
        "generationConfig",
        Map.of("responseMimeType", "application/json", "temperature", 0.1, "maxOutputTokens", 8192));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
    String url = geminiApiUrl + "?key=" + geminiApiKey;

    try {
      String responseStr = restTemplate.postForObject(url, requestEntity, String.class);
      JsonNode root = objectMapper.readTree(responseStr);
      JsonNode candidates = root.path("candidates");
      if (candidates.isArray() && candidates.size() > 0) {
        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (parts.isArray() && parts.size() > 0) {
          String json = parts.get(0).path("text").asText();
          if (json.startsWith("```json")) json = json.replace("```json", "");
          if (json.startsWith("```")) json = json.replace("```", "");
          if (json.endsWith("```")) json = json.substring(0, json.lastIndexOf("```"));
          return json.trim();
        }
      }
      throw new RuntimeException("Không nhận được phản hồi hợp lệ từ Gemini");
    } catch (Exception e) {
      log.error("Lỗi khi gọi Gemini API (parse JD)", e);
      throw new RuntimeException("Lỗi xử lý AI: " + e.getMessage());
    }
  }
}

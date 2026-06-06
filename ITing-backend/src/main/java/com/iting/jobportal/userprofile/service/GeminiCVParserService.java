package com.iting.jobportal.userprofile.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiCVParserService {

  @Value("${gemini.api.key}")
  private String geminiApiKey;

  @Value("${gemini.api.url}")
  private String geminiApiUrl;

  // RestTemplate với timeout 50s (parse CV dài hơn score CV vì phải xử lý PDF text + reasoning).
  // Default RestTemplate timeout = -1 (infinite) → dễ vượt nginx 504.
  private final RestTemplate restTemplate = buildRestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  private static RestTemplate buildRestTemplate() {
    org.springframework.http.client.SimpleClientHttpRequestFactory factory =
            new org.springframework.http.client.SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(10_000);  // 10s cho TCP connect
    factory.setReadTimeout(50_000);     // 50s cho response (parse CV dài)
    return new RestTemplate(factory);
  }

  public String parseCV(MultipartFile file) throws Exception {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("File CV không được để trống");
    }

    String mimeType = file.getContentType();
    String cvText = "";

    if (mimeType != null && mimeType.equals("application/pdf")) {
      // Extract text using PDFBox
      try (InputStream is = file.getInputStream();
          PDDocument document = PDDocument.load(is)) {
        PDFTextStripper stripper = new PDFTextStripper();
        cvText = stripper.getText(document);
      } catch (Exception e) {
        log.warn("Lỗi khi đọc PDF, sẽ chuyển sang dùng inline_data", e);
      }
    }

    String prompt =
        "Bạn là một chuyên gia nhân sự. Hãy đọc nội dung file CV sau đây và trích xuất các thông"
            + " tin chuyên môn.\n"
            + "Nội dung CV:\n"
            + (cvText.isEmpty() ? "(File đính kèm)" : cvText)
            + "\n\n"
            + "Hãy trả về MỘT CHUỖI JSON DUY NHẤT (không bọc trong markdown ```json ... ```, chỉ"
            + " bắt đầu bằng { và kết thúc bằng }) theo định dạng sau: \n"
            + "{ \n"
            + "\"skills\": [\"kỹ năng 1\", \"kỹ năng 2\"], \n"
            + "\"experiences\": [ { \"companyName\": \"Tên công ty\", \"position\": \"Vị trí\","
            + " \"startDate\": \"YYYY-MM\", \"endDate\": \"YYYY-MM\", \"description\": \"Mô tả"
            + " ngắn\" } ], \n"
            + "\"educations\": [ { \"schoolName\": \"Tên trường\", \"degree\": \"Bằng cấp/Chuyên"
            + " ngành\", \"startDate\": \"YYYY-MM\", \"endDate\": \"YYYY-MM\" } ], \n"
            + "\"certificates\": [ { \"name\": \"Tên chứng chỉ\", \"organization\": \"Tổ chức"
            + " cấp\", \"issueDate\": \"YYYY-MM\" } ] \n"
            + "}. Nếu không tìm thấy thông tin nào, hãy để mảng rỗng [].";

    // Build the payload
    Map<String, Object> textPart = new HashMap<>();
    textPart.put("text", prompt);

    Map<String, Object> content = new HashMap<>();

    if (cvText.isEmpty()) {
      // Fallback: send as inline base64 if not PDF or PDFBox failed
      if (mimeType == null
          || (!mimeType.equals("application/pdf") && !mimeType.startsWith("image/"))) {
        mimeType = "application/pdf";
      }
      String base64Data = Base64.getEncoder().encodeToString(file.getBytes());
      Map<String, Object> inlineData = new HashMap<>();
      inlineData.put("mime_type", mimeType);
      inlineData.put("data", base64Data);

      Map<String, Object> inlineDataPart = new HashMap<>();
      inlineDataPart.put("inline_data", inlineData);

      content.put("parts", List.of(textPart, inlineDataPart));
    } else {
      content.put("parts", List.of(textPart));
    }

    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("contents", List.of(content));

    // Gemini 2.5 Flash hỗ trợ responseMimeType="application/json" → output JSON thuần,
    // không cần manual strip markdown code fences.
    requestBody.put("generationConfig", Map.of(
            "responseMimeType", "application/json",
            "temperature", 0.1,
            "maxOutputTokens", 8192
    ));

    // Create headers
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

    String url = geminiApiUrl + "?key=" + geminiApiKey;

    try {
      String responseStr = restTemplate.postForObject(url, requestEntity, String.class);
      JsonNode rootNode = objectMapper.readTree(responseStr);

      // Extract the generated text
      JsonNode candidates = rootNode.path("candidates");
      if (candidates.isArray() && candidates.size() > 0) {
        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (parts.isArray() && parts.size() > 0) {
          String jsonResult = parts.get(0).path("text").asText();
          // Clean markdown code blocks if AI still adds them
          if (jsonResult.startsWith("```json")) {
            jsonResult = jsonResult.replace("```json", "");
          }
          if (jsonResult.startsWith("```")) {
            jsonResult = jsonResult.replace("```", "");
          }
          if (jsonResult.endsWith("```")) {
            jsonResult = jsonResult.substring(0, jsonResult.lastIndexOf("```"));
          }
          return jsonResult.trim();
        }
      }
      throw new RuntimeException("Không nhận được phản hồi hợp lệ từ Gemini");
    } catch (Exception e) {
      log.error("Lỗi khi gọi Gemini API", e);
      throw new RuntimeException("Lỗi xử lý AI: " + e.getMessage());
    }
  }
}

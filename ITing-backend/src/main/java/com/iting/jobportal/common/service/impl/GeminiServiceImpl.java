package com.iting.jobportal.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class GeminiServiceImpl implements GeminiService {

  @Value("${gemini.api.key:}")
  private String geminiApiKey;

  @Value("${gemini.api.url:}")
  private String geminiApiUrl;

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public JobSearchRequest extractSearchCriteriaFromCv(String cvText) {
    log.warn("GeminiService.extractSearchCriteriaFromCv: AI chưa được kích hoạt, trả về rỗng");
    return new JobSearchRequest();
  }

  @Override
  public List<String> expandSearchTerms(String keyword) {
    log.warn("GeminiService.expandSearchTerms: AI chưa được kích hoạt, trả về rỗng");
    return Collections.emptyList();
  }

  /**
   * Gọi Gemini API thật để kiểm duyệt 1 tin tuyển dụng. Trả về plain text kết thúc bằng dòng
   * "FINAL_DECISION: [APPROVE|REJECT|NEEDS_REVIEW]" — caller (AdminJobServiceImpl) parse pattern này
   * để set aiReviewStatus + auto approve/reject.
   *
   * <p>Fallback an toàn: nếu API key trống hoặc Gemini lỗi → trả NEEDS_REVIEW để admin review tay.
   */
  @Override
  public String reviewJob(Job job) {
    if (geminiApiKey == null || geminiApiKey.isBlank()) {
      log.warn("GeminiService.reviewJob: GEMINI_API_KEY trống, mặc định NEEDS_REVIEW job id={}",
          job.getId());
      return "FINAL_DECISION: [NEEDS_REVIEW] - GEMINI_API_KEY chưa cấu hình. Vui lòng kiểm tra tay.";
    }

    String prompt = buildReviewPrompt(job);

    Map<String, Object> textPart = new HashMap<>();
    textPart.put("text", prompt);
    Map<String, Object> content = new HashMap<>();
    content.put("parts", List.of(textPart));
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("contents", List.of(content));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

    String url = geminiApiUrl + "?key=" + geminiApiKey;

    try {
      String responseStr = restTemplate.postForObject(url, entity, String.class);
      JsonNode root = objectMapper.readTree(responseStr);
      JsonNode candidates = root.path("candidates");
      if (candidates.isArray() && candidates.size() > 0) {
        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (parts.isArray() && parts.size() > 0) {
          String text = parts.get(0).path("text").asText("").trim();
          if (!text.isEmpty()) {
            // Đảm bảo response có FINAL_DECISION tag — nếu Gemini quên thì thêm NEEDS_REVIEW
            if (!text.contains("FINAL_DECISION:")) {
              text = text + "\n\nFINAL_DECISION: [NEEDS_REVIEW]";
            }
            log.info("[Gemini] reviewJob id={} ok ({} chars)", job.getId(), text.length());
            return text;
          }
        }
      }
      log.warn("[Gemini] reviewJob id={} empty response, default NEEDS_REVIEW", job.getId());
      return "FINAL_DECISION: [NEEDS_REVIEW] - Gemini trả phản hồi rỗng, cần admin kiểm tra tay.";
    } catch (Exception e) {
      log.error("[Gemini] reviewJob id={} failed: {}", job.getId(), e.getMessage());
      return "FINAL_DECISION: [NEEDS_REVIEW] - Lỗi gọi Gemini ("
          + e.getClass().getSimpleName()
          + "). Vui lòng kiểm tra tay.";
    }
  }

  /** Build prompt tiếng Việt: yêu cầu Gemini phân tích job + kết thúc bằng FINAL_DECISION tag. */
  private String buildReviewPrompt(Job job) {
    StringBuilder sb = new StringBuilder();
    sb.append("Bạn là chuyên gia kiểm duyệt nội dung của một nền tảng tuyển dụng IT tại Việt Nam.\n");
    sb.append("Hãy phân tích tin tuyển dụng sau đây và đánh giá rủi ro/vi phạm.\n\n");
    sb.append("TIÊU CHÍ TỪ CHỐI ([REJECT]):\n");
    sb.append("- Lừa đảo, đa cấp, MLM, việc nhẹ lương cao bất hợp lý\n");
    sb.append("- Yêu cầu nộp tiền cọc/giấy tờ gốc/CMND/tài khoản ngân hàng ở bước ứng tuyển\n");
    sb.append("- Phân biệt đối xử (giới tính, vùng miền, dân tộc, ngoại hình, tuổi tác trái quy định)\n");
    sb.append("- Mức lương cam kết không thực tế (>3 lần thị trường)\n");
    sb.append("- Nội dung trống/không liên quan công việc/spam/quảng cáo dịch vụ khác\n\n");
    sb.append("TIÊU CHÍ CẦN ADMIN XEM ([NEEDS_REVIEW]):\n");
    sb.append("- Có dấu hiệu nghi ngờ nhưng chưa đủ chứng cứ\n");
    sb.append("- Thông tin mơ hồ về công ty, vị trí, lương\n\n");
    sb.append("TIÊU CHÍ DUYỆT ([APPROVE]):\n");
    sb.append("- Nội dung rõ ràng, hợp lệ, tuân thủ luật lao động VN\n\n");
    sb.append("NỘI DUNG TIN ĐĂNG:\n");
    sb.append("- Tiêu đề: ").append(safe(job.getTitle())).append("\n");
    sb.append("- Vị trí: ").append(safe(job.getPosition())).append("\n");
    if (job.getCompany() != null) {
      sb.append("- Công ty: ").append(safe(job.getCompany().getName())).append("\n");
    }
    sb.append("- Loại hình: ").append(safe(job.getJobType())).append("\n");
    sb.append("- Cấp bậc: ").append(safe(job.getExperienceLevel())).append("\n");
    sb.append("- Mức lương: ");
    if (job.getMinSalary() != null || job.getMaxSalary() != null) {
      sb.append(job.getMinSalary() != null ? job.getMinSalary() : "?")
          .append(" - ")
          .append(job.getMaxSalary() != null ? job.getMaxSalary() : "?")
          .append(" VND");
    } else {
      sb.append("Thỏa thuận");
    }
    sb.append("\n");
    sb.append("- Địa điểm: ").append(safe(job.getLocation())).append("\n");
    sb.append("- Mô tả:\n").append(safe(job.getDescription())).append("\n");
    sb.append("- Yêu cầu:\n").append(safe(job.getRequirements())).append("\n");
    sb.append("- Quyền lợi:\n").append(safe(job.getBenefits())).append("\n\n");
    sb.append("HÃY TRẢ VỀ ĐÚNG FORMAT (TIẾNG VIỆT, NGẮN GỌN ≤ 6 DÒNG):\n");
    sb.append("- Nhận xét tổng quan (1-2 dòng)\n");
    sb.append("- Liệt kê vi phạm/dấu hiệu rủi ro (nếu có)\n");
    sb.append("- KẾT THÚC BẰNG ĐÚNG MỘT DÒNG cuối: \"FINAL_DECISION: [APPROVE]\" HOẶC ");
    sb.append("\"FINAL_DECISION: [REJECT]\" HOẶC \"FINAL_DECISION: [NEEDS_REVIEW]\"");
    return sb.toString();
  }

  private static String safe(Object v) {
    if (v == null) return "(không có)";
    String s = v.toString().trim();
    return s.isEmpty() ? "(không có)" : s;
  }

  @Override
  public String generateCoverLetter(
      String candidateName, List<String> skills, String bio, int yearsExperience, Job job) {
    log.warn("GeminiService.generateCoverLetter: AI chưa được kích hoạt, trả về template tĩnh");
    String company =
        (job != null && job.getCompany() != null) ? job.getCompany().getName() : "Quý công ty";
    String title = (job != null && job.getTitle() != null) ? job.getTitle() : "vị trí ứng tuyển";
    StringBuilder sb = new StringBuilder();
    sb.append("Kính gửi ").append(company).append(",\n\n");
    sb.append("Tôi là ")
        .append(candidateName != null ? candidateName : "ứng viên")
        .append(", có ")
        .append(yearsExperience)
        .append(" năm kinh nghiệm. ");
    sb.append("Tôi quan tâm tới vị trí ").append(title).append(" tại quý công ty.\n\n");
    if (bio != null && !bio.isBlank()) {
      sb.append(bio).append("\n\n");
    }
    if (skills != null && !skills.isEmpty()) {
      sb.append("Kỹ năng nổi bật: ").append(String.join(", ", skills)).append(".\n\n");
    }
    sb.append("Rất mong được trao đổi thêm.\n\nTrân trọng,\n")
        .append(candidateName != null ? candidateName : "Ứng viên");
    return sb.toString();
  }
}

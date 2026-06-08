package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RateLimited;
import com.iting.jobportal.common.service.S3Service;
import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.userprofile.dto.response.CVResponse;
import com.iting.jobportal.userprofile.dto.response.CvScoreResponse;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.service.CVScoringWithPdfService;
import com.iting.jobportal.userprofile.service.CVService;
import com.iting.jobportal.userprofile.service.GeminiCVParserService;
import com.iting.jobportal.userprofile.service.embedding.HuggingFaceCvExtractionClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "09.1 CV Management", description = "APIs for managing CVs")
@RestController
@RequestMapping("/api/candidates/cvs")
@RequiredArgsConstructor
@Slf4j
public class CVController {

  private final CVService cvService;
  private final CVScoringWithPdfService cvScoringWithPdfService;
  private final GeminiCVParserService geminiCVParserService;
  private final HuggingFaceCvExtractionClient hfCvExtractionClient;
  private final CVRepository cvRepository;
  private final S3Service s3Service;

  @GetMapping("/recent")
  @Operation(
      summary = "Lấy 3 CV mới nhất của người dùng",
      description =
          "Endpoint này được gọi khi người dùng bấm nút Apply để hiển thị danh sách CV đã upload")
  public ResponseEntity<List<CVResponse>> getRecentCVs(
      @Parameter(hidden = true) @CurrentUser Long userId) {
    List<CVResponse> cvs = cvService.getRecentCVs(userId);
    return ResponseEntity.ok(cvs);
  }

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Upload CV mới",
      description = "Upload CV mới cho người dùng. Tự động xóa CV cũ nhất nếu vượt quá 3 CVs")
  @RateLimited(policy = RateLimitPolicy.FILE_UPLOAD, subject = "user")
  public ResponseEntity<CVResponse> uploadCV(
      @Parameter(hidden = true) @CurrentUser Long userId,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "title", required = false) String title) {
    try {
      CVResponse response = cvService.uploadCV(userId, file, title);
      return ResponseEntity.ok(response);
    } catch (IOException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @GetMapping("/{id}/view-url")
  @Operation(
      summary = "Lấy presigned URL mới để xem CV (tránh URL S3 hết hạn)",
      description = "Trả về URL có hiệu lực 1 giờ. Chỉ chủ sở hữu CV mới gọi được.")
  public ResponseEntity<Map<String, String>> getCvViewUrl(
      @Parameter(hidden = true) @CurrentUser Long userId, @PathVariable Long id) {
    if (userId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
    }
    CV cv =
        cvRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CV không tồn tại"));
    if (cv.getProfile() == null || !userId.equals(cv.getProfile().getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CV không thuộc về bạn");
    }
    // Ưu tiên s3Key; nếu null → cố gắng extract key từ fileUrl (CV cũ chưa có s3Key column).
    String key =
        (cv.getS3Key() != null && !cv.getS3Key().isBlank())
            ? cv.getS3Key()
            : extractS3KeyFromUrl(cv.getFileUrl());

    if (key == null || key.isBlank()) {
      // Không phải S3 (vd local path) → trả nguyên fileUrl.
      return ResponseEntity.ok(Map.of("url", cv.getFileUrl() != null ? cv.getFileUrl() : ""));
    }
    String fresh = s3Service.getPreSignedUrl(key);
    return ResponseEntity.ok(Map.of("url", fresh));
  }

  /**
   * Extract S3 object key từ URL kiểu:
   * https://bucket.s3.region.amazonaws.com/cvs/user_1/abc.pdf?X-Amz-...
   * https://s3.amazonaws.com/bucket/cvs/user_1/abc.pdf?... Trả về null nếu URL không phải S3.
   */
  private String extractS3KeyFromUrl(String url) {
    if (url == null || url.isBlank()) return null;
    if (!url.contains("amazonaws.com")) return null;
    try {
      // Bỏ query string trước
      String noQuery = url.split("\\?", 2)[0];
      // Lấy path sau hostname
      java.net.URI uri = java.net.URI.create(noQuery);
      String path = uri.getPath(); // /cvs/user_1/abc.pdf  hoặc  /bucket/cvs/user_1/abc.pdf
      if (path == null || path.isBlank()) return null;
      // Trim leading slash
      String key = path.startsWith("/") ? path.substring(1) : path;
      // Path-style URL "s3.amazonaws.com/bucket/cvs/..." → bỏ bucket name ở đầu
      if (uri.getHost() != null && uri.getHost().startsWith("s3.") && key.contains("/")) {
        key = key.substring(key.indexOf('/') + 1);
      }
      return key.isBlank() ? null : key;
    } catch (Exception e) {
      return null;
    }
  }

  @GetMapping("/count")
  @Operation(summary = "Kiểm tra số lượng CV đã upload")
  public ResponseEntity<Map<String, Object>> getCVCount(
      @Parameter(hidden = true) @CurrentUser Long userId) {
    List<CVResponse> cvs = cvService.getRecentCVs(userId);
    return ResponseEntity.ok(
        Map.of("count", cvs.size(), "maxAllowed", 3, "hasReachedLimit", cvs.size() >= 3));
  }

  @PostMapping(
      value = "/parse",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @RateLimited(policy = RateLimitPolicy.FILE_UPLOAD, subject = "user")
  @Operation(
      summary = "Phân tích CV bằng AI (Gemini)",
      description =
          "Đọc file PDF/Image CV và trích xuất thông tin kỹ năng, học vấn, kinh nghiệm thành JSON")
  public ResponseEntity<?> parseCV(
      @Parameter(hidden = true) @CurrentUser Long userId,
      @RequestParam("file") MultipartFile file) {
    try {
      String jsonResult = geminiCVParserService.parseCV(file);
      return ResponseEntity.ok(jsonResult); // Already a JSON string
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping(
      value = "/extract-ai",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Trích xuất CV bằng HF AI Matching API",
      description =
          "Gọi HF /extract-cv: parse PDF/Image thành JSON cấu trúc kèm embedding vector (Gemma"
              + " 768d)")
  @RateLimited(policy = RateLimitPolicy.FILE_UPLOAD, subject = "user")
  public ResponseEntity<?> extractWithHfAi(
      @Parameter(hidden = true) @CurrentUser Long userId,
      @RequestParam("file") MultipartFile file) {
    return hfCvExtractionClient
        .extract(file)
        .<ResponseEntity<?>>map(
            result ->
                result.isSuccess()
                    ? ResponseEntity.ok(
                        Map.of(
                            "status", result.status(),
                            "extractedData", result.extractedData(),
                            "dimension", result.embedding() != null ? result.embedding().length : 0,
                            "embedding", result.embedding()))
                    : ResponseEntity.badRequest()
                        .body(
                            Map.of(
                                "status", result.status() != null ? result.status() : "error",
                                "error",
                                    result.error() != null ? result.error() : "extraction failed")))
        .orElseGet(
            () -> ResponseEntity.status(502).body(Map.of("error", "HF AI service unavailable")));
  }

    @PostMapping("/{id}/score")
    @Operation(summary = "Chấm điểm CV bằng AI (hỗ trợ tiếng Việt / English)",
               description = "Đánh giá chất lượng CV theo 5 tiêu chí. Ngôn ngữ đầu ra: ?lang=vi (mặc định) hoặc ?lang=en. "
                       + "Service đọc trực tiếp PDF từ S3 và gửi tới Gemini 2.5 Flash dạng multimodal (PDF + prompt) "
                       + "để phân tích đầy đủ cả content lẫn layout.")
    @RateLimited(policy = RateLimitPolicy.AI_CV_SCORE, subject = "user")
    public ResponseEntity<?> scoreCv(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @PathVariable Long id,
            @RequestParam(value = "lang", defaultValue = "vi") String language) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        try {
            // Dùng service tách biệt: đọc PDF trực tiếp → multimodal Gemini → đánh giá đầy đủ
            // 7 sections (career objectives, work experience, projects, education, skills,
            // certifications, languages) thay vì chỉ 3 sections từ HF extraction.
            CvScoreResponse result = cvScoringWithPdfService.scoreCvWithPdf(userId, id, language);
            if (result == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "CV không tồn tại hoặc không thể đọc file");
            }
            return ResponseEntity.ok(result);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            // Ownership check fail hoặc CV không tồn tại (từ service layer)
            throw e;
        } catch (RuntimeException e) {
            // Phân biệt lỗi "AI service down" vs các lỗi khác.
            // Lỗi AI → 502 Bad Gateway. Lỗi khác → 500 Internal Server Error.
            if (e.getMessage() != null && e.getMessage().contains("AI service temporarily")) {
                log.warn("AI scoring failed for cvId={}: {}", id, e.getMessage());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "AI service tạm thời không khả dụng, vui lòng thử lại sau");
            }
            log.error("Unexpected error scoring cvId={}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Đã có lỗi xảy ra khi chấm điểm CV");
        }
    }
}

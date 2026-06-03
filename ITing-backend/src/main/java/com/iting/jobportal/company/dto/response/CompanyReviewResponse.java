package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.file.FileUploadService;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyReviewResponse {
  private Long id;
  private String authorName;
  private String authorAvatar;
  private int rating;
  private String content;
  private LocalDateTime createdAt;

  /**
   * Backward-compat: build response từ entity nhưng KHÔNG re-presign avatar. Trả URL gốc trong DB —
   * có thể đã hết hạn nếu là S3 presigned URL. Caller nên dùng overload {@link
   * #fromEntity(CompanyReview, FileUploadService)} thay vì gọi cái này.
   */
  public static CompanyReviewResponse fromEntity(CompanyReview review) {
    return fromEntity(review, null);
  }

  /**
   * Build response từ entity và re-presign avatar URL (15 phút) để tránh lỗi S3 "Request has
   * expired" khi link được sinh ra cách đây > 1 giờ.
   *
   * @param review entity nguồn
   * @param fileService có thể null (skip re-presign). Truyền vào để re-presign.
   */
  public static CompanyReviewResponse fromEntity(
      CompanyReview review, FileUploadService fileService) {
    String name = "Anonymous";
    String avatar = null;

    var reviewer = review.getAccount();
    if (reviewer != null) {
      name = reviewer.getFullName() != null ? reviewer.getFullName() : "Anonymous";
      avatar = resolveAvatar(reviewer.getAvatarUrl(), fileService);
    }

    return CompanyReviewResponse.builder()
        .id(review.getId())
        .authorName(name)
        .authorAvatar(avatar)
        .rating(review.getRating())
        .content(review.getContent())
        .createdAt(review.getCreatedAt())
        .build();
  }

  /** Re-presign nếu là S3 URL; trả nguyên nếu là path tương đối hoặc data URL. */
  private static String resolveAvatar(String raw, FileUploadService fileService) {
    if (raw == null || raw.isBlank()) return null;
    if (fileService == null) return raw;
    // Chỉ re-presign URL S3 (chứa amazonaws.com hoặc bắt đầu bằng s3 key). Để string bình thường
    // yên.
    if (!raw.contains("amazonaws.com") && !raw.startsWith("avatars/") && !raw.startsWith("s3://")) {
      return raw;
    }
    try {
      return fileService.generatePresignedUrl(raw, 60); // 60 phút — đủ để user xem qua list review
    } catch (Exception e) {
      return raw; // fallback giữ URL cũ — UI sẽ hỏng nhưng không crash response
    }
  }
}

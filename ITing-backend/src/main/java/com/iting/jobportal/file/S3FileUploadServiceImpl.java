package com.iting.jobportal.file;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "aws.enabled", havingValue = "true")
public class S3FileUploadServiceImpl implements FileUploadService {

  private final S3Client s3Client;
  private final S3Presigner s3Presigner;

  @Value("${aws.s3.bucket}")
  private String bucket;

  @Value("${aws.s3.region}")
  private String region;

  @Override
  public String uploadCV(MultipartFile file) {
    return upload(file, "cv");
  }

  @Override
  public String uploadPortfolio(MultipartFile file) {
    return upload(file, "portfolio");
  }

  @Override
  public String uploadAvatar(MultipartFile file) {
    return upload(file, "avatar");
  }

  @Override
  public String uploadBusinessLicense(MultipartFile file) {
    return upload(file, "business-license");
  }

  @Override
  public String uploadConsentDocument(MultipartFile file) {
    return upload(file, "consent-document");
  }

  @Override
  public String uploadLogo(MultipartFile file) {
    return upload(file, "company-logo");
  }

  @Override
  public String uploadBlogImage(MultipartFile file) {
    String rawUrl = upload(file, "blog");
    // Bucket private → URL S3 thô bị 403 khi <img> tải. Trả URL proxy same-origin để backend
    // presign-redirect lúc hiển thị (xem BlogImageController). Lưu URL proxy này vào nội dung blog.
    String prefix = "amazonaws.com/";
    int idx = rawUrl.indexOf(prefix);
    String key = idx >= 0 ? rawUrl.substring(idx + prefix.length()) : rawUrl;
    return "/api/public/blog-image?key=" + key;
  }

  @Override
  public String generatePresignedUrl(String fileUrl, int minutes) {
    if (fileUrl == null || fileUrl.isBlank()) {
      throw new IllegalArgumentException("fileUrl không được để trống");
    }

    String prefix = "amazonaws.com/";
    int idx = fileUrl.indexOf(prefix);
    if (idx < 0) {
      throw new IllegalArgumentException("fileUrl không phải URL S3 hợp lệ");
    }

    String key = fileUrl.substring(idx + prefix.length());

    GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucket).key(key).build();

    GetObjectPresignRequest presignRequest =
        GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(minutes))
            .getObjectRequest(getObjectRequest)
            .build();

    URL presignedUrl = s3Presigner.presignGetObject(presignRequest).url();
    return presignedUrl.toString();
  }

  @Override
  public String presignByKey(String key, int minutes) {
    GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(bucket).key(key).build();
    GetObjectPresignRequest presignRequest =
        GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(minutes))
            .getObjectRequest(getObjectRequest)
            .build();
    return s3Presigner.presignGetObject(presignRequest).url().toString();
  }

  @Override
  public boolean objectExists(String fileUrl) {
    if (fileUrl == null || fileUrl.isBlank()) {
      return false;
    }
    String prefix = "amazonaws.com/";
    int idx = fileUrl.indexOf(prefix);
    if (idx < 0) {
      return false;
    }
    String key = fileUrl.substring(idx + prefix.length());
    try {
      s3Client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
      return true;
    } catch (S3Exception e) {
      // 404 (NoSuchKey) → object không tồn tại. Các lỗi khác cũng coi như không xem được để
      // tránh trả presigned URL hỏng (gây lỗi S3 thô khi hiển thị preview).
      if (e.statusCode() != 404) {
        log.warn("Không kiểm tra được object S3 key={} ({})", key, e.awsErrorDetails() != null
            ? e.awsErrorDetails().errorCode() : e.getMessage());
      }
      return false;
    }
  }

  /** Delete a file from S3 by its full URL. */
  public void deleteByUrl(String fileUrl) {
    if (fileUrl == null || fileUrl.isBlank()) return;
    // Extract key from URL: https://<bucket>.s3.<region>.amazonaws.com/<key>
    String prefix = "amazonaws.com/";
    int idx = fileUrl.indexOf(prefix);
    if (idx >= 0) {
      String key = fileUrl.substring(idx + prefix.length());
      s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
  }

  @Override
  public String uploadBytes(byte[] bytes, String key, String contentType) {
    PutObjectRequest request =
        PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(contentType)
            .contentLength((long) bytes.length)
            .build();
    s3Client.putObject(request, RequestBody.fromBytes(bytes));
    return buildPublicUrl(key);
  }

  // ========== PRIVATE HELPERS ==========

  private String upload(MultipartFile file, String folder) {
    String originalFilename = file.getOriginalFilename();
    String ext =
        (originalFilename != null && originalFilename.contains("."))
            ? originalFilename.substring(originalFilename.lastIndexOf('.'))
            : "";
    String key = folder + "/" + UUID.randomUUID() + ext;

    try {
      PutObjectRequest request =
          PutObjectRequest.builder()
              .bucket(bucket)
              .key(key)
              .contentType(file.getContentType())
              .contentLength(file.getSize())
              .build();

      s3Client.putObject(
          request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
    } catch (IOException e) {
      throw new RuntimeException("Failed to upload file to S3", e);
    }

    return buildPublicUrl(key);
  }

  private String buildPublicUrl(String key) {
    return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
  }
}

package com.iting.jobportal.file;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

  String uploadPortfolio(MultipartFile file);

  String uploadCV(MultipartFile file);

  String generatePresignedUrl(String fileUrl, int minutes);

  /**
   * Tạo presigned GET URL trực tiếp từ S3 key (vd "blog/uuid.jpg"). Dùng cho proxy hiển thị ảnh blog
   * khi bucket private. Local storage trả về URL tĩnh theo key.
   */
  String presignByKey(String key, int minutes);

  /**
   * Kiểm tra object/tệp tương ứng với {@code fileUrl} có thực sự tồn tại trên storage hay không.
   * Dùng để tránh cấp presigned URL trỏ tới object không tồn tại (gây lỗi S3 NoSuchKey thô khi
   * hiển thị preview). Trả về {@code false} nếu URL trống, không hợp lệ, hoặc object không tồn tại.
   */
  boolean objectExists(String fileUrl);

  String uploadAvatar(MultipartFile file);

  String uploadBusinessLicense(MultipartFile file);

  String uploadConsentDocument(MultipartFile file);

  String uploadLogo(MultipartFile file);

  /** Upload image dùng trong rich-text editor (blog content). */
  String uploadBlogImage(MultipartFile file);

  /**
   * Upload raw bytes (e.g. generated PDF invoice/report) to the configured storage under a specific
   * key. Returns the public URL where the object can be fetched.
   */
  String uploadBytes(byte[] bytes, String key, String contentType);

  void deleteByUrl(String fileUrl);
}

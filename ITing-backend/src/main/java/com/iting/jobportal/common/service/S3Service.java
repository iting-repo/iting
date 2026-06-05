package com.iting.jobportal.common.service;

import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
  /** Upload file to S3 and return the S3 key */
  String uploadFile(MultipartFile file, String folder) throws IOException;

  /** Delete file from S3 */
  void deleteFile(String s3Key);

  /** Get pre-signed URL for file download (valid for 1 hour) */
  String getPreSignedUrl(String s3Key);

  /** Generate S3 key for CV file */
  String generateCvS3Key(Long userId, String originalFilename);

  /**
   * Download file bytes from S3 by key.
   * Dùng cho server-side processing (vd CV scoring với multimodal AI).
   * Không nên dùng để serve file cho user — dùng {@link #getPreSignedUrl} cho case đó.
   *
   * @param s3Key S3 object key
   * @return file content as byte array
   */
  byte[] downloadFile(String s3Key);
}

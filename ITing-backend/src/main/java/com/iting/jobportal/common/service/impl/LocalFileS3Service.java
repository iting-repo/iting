package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.common.service.S3Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Fallback local file storage khi AWS S3 chưa được cấu hình. File được lưu vào thư mục uploads/ ở
 * root project.
 */
@Service
@ConditionalOnMissingBean(S3ServiceImpl.class)
@Slf4j
public class LocalFileS3Service implements S3Service {

  private static final String UPLOAD_DIR = "uploads";

  @Override
  public String uploadFile(MultipartFile file, String folder) throws IOException {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("Cannot upload empty file");
    }

    String originalFilename = file.getOriginalFilename();
    String fileExtension = getFileExtension(originalFilename);
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    String uniqueId = UUID.randomUUID().toString().substring(0, 8);
    String key = String.format("%s/%s_%s.%s", folder, timestamp, uniqueId, fileExtension);

    Path uploadPath = Paths.get(UPLOAD_DIR, key);
    Files.createDirectories(uploadPath.getParent());
    Files.copy(file.getInputStream(), uploadPath);

    log.info("Saved file locally (S3 fallback): {}", uploadPath);
    return key;
  }

  @Override
  public void deleteFile(String s3Key) {
    try {
      Path filePath = Paths.get(UPLOAD_DIR, s3Key);
      Files.deleteIfExists(filePath);
      log.info("Deleted local file: {}", filePath);
    } catch (IOException e) {
      log.error("Failed to delete local file: {}", s3Key, e);
    }
  }

  @Override
  public String getPreSignedUrl(String s3Key) {
    // Trả về URL tương đối cho local file serving
    return "/api/files/" + s3Key;
  }

  @Override
  public String generateCvS3Key(Long userId, String originalFilename) {
    String fileExtension = getFileExtension(originalFilename);
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    String uniqueId = UUID.randomUUID().toString().substring(0, 8);
    return String.format("cvs/user_%d/%s_%s.%s", userId, timestamp, uniqueId, fileExtension);
  }

  private String getFileExtension(String filename) {
    if (filename == null || !filename.contains(".")) {
      return "pdf";
    }
    return filename.substring(filename.lastIndexOf(".") + 1);
  }
}

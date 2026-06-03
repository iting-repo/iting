package com.iting.jobportal.common.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Serve file upload local khi chạy development (không dùng S3). */
@RestController
@RequestMapping("/api/files")
public class LocalFileController {

  private static final String UPLOAD_DIR = "uploads";

  @GetMapping("/**")
  public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
    String path = request.getRequestURI().replaceFirst("/api/files/", "");
    Path filePath = Paths.get(UPLOAD_DIR, path);

    if (!filePath.toFile().exists()) {
      return ResponseEntity.notFound().build();
    }

    Resource resource = new FileSystemResource(filePath);
    String contentType = "application/octet-stream";
    if (path.endsWith(".pdf")) {
      contentType = "application/pdf";
    } else if (path.endsWith(".png")) {
      contentType = "image/png";
    } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    }

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(
            HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName() + "\"")
        .body(resource);
  }
}

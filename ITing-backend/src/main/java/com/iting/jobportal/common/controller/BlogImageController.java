package com.iting.jobportal.common.controller;

import com.iting.jobportal.file.FileUploadService;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Proxy hiển thị ảnh blog khi bucket S3 private. Nội dung blog lưu URL dạng
 * {@code /api/public/blog-image?key=blog/uuid.jpg}; endpoint này presign object rồi 302-redirect sang
 * URL S3 tạm thời. Endpoint công khai (ảnh blog là nội dung công khai); chỉ cho phép key trong thư
 * mục {@code blog/} để tránh presign object tùy ý.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class BlogImageController {

  private final FileUploadService fileUploadService;

  @GetMapping("/blog-image")
  public ResponseEntity<Void> blogImage(@RequestParam("key") String key) {
    if (key == null || !key.startsWith("blog/") || key.contains("..")) {
      return ResponseEntity.badRequest().build();
    }
    String presigned = fileUploadService.presignByKey(key, 360);
    return ResponseEntity.status(HttpStatus.FOUND)
        .header("Cache-Control", "no-cache")
        .location(URI.create(presigned))
        .build();
  }
}

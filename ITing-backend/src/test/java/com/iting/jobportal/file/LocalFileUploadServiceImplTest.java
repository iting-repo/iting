package com.iting.jobportal.file;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class LocalFileUploadServiceImplTest {

  private final LocalFileUploadServiceImpl service = new LocalFileUploadServiceImpl();

  @AfterEach
  void cleanUp() throws IOException {
    Path uploads = Path.of("uploads");
    if (Files.exists(uploads)) {
      Files.walk(uploads)
          .sorted((a, b) -> b.getNameCount() - a.getNameCount())
          .forEach(
              path -> {
                try {
                  Files.deleteIfExists(path);
                } catch (IOException ignored) {
                }
              });
    }
  }

  @Test
  void uploadAvatar_shouldPersistFileUnderUploadsDirectory() {
    MockMultipartFile file =
        new MockMultipartFile("file", "avatar.png", "image/png", "avatar".getBytes());

    String url = service.uploadAvatar(file);

    assertTrue(url.startsWith("/uploads/avatar/"));
    assertTrue(Files.exists(Path.of(url.substring(1))));
  }

  @Test
  void generatePresignedUrl_shouldReturnSameLocalUrl() {
    assertEquals("/uploads/avatar/a.png", service.generatePresignedUrl("/uploads/avatar/a.png", 5));
  }

  @Test
  void deleteByUrl_shouldDeleteExistingFile() throws IOException {
    Path dir = Path.of("uploads", "avatar");
    Files.createDirectories(dir);
    Path file = dir.resolve("temp.txt");
    Files.writeString(file, "data");

    service.deleteByUrl("/uploads/avatar/temp.txt");

    assertFalse(Files.exists(file));
  }
}

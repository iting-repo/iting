package com.iting.jobportal.common.service.impl;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test thực sự ghi file local — tốc độ nhanh, không cần mock S3.
 * Cleanup uploads/ folder sau mỗi test để không leak rác.
 */
class LocalFileS3ServiceTest {

    private final LocalFileS3Service service = new LocalFileS3Service();

    @AfterEach
    void cleanup() throws IOException {
        Path uploads = Paths.get("uploads");
        if (Files.exists(uploads)) {
            // delete recursively, deepest first
            Files.walk(uploads)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                    });
        }
    }

    // ── uploadFile ──────────────────────────────────────────────────────

    @Test
    void uploadFile_savesAndReturnsKey() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "hello".getBytes());

        String key = service.uploadFile(file, "cvs/user_1");

        assertTrue(key.startsWith("cvs/user_1/"));
        assertTrue(key.endsWith(".pdf"));
        // File phải tồn tại trên đĩa
        assertTrue(Files.exists(Paths.get("uploads", key)));
    }

    @Test
    void uploadFile_emptyFile_throws() {
        MockMultipartFile empty = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        assertThrows(IllegalArgumentException.class, () -> service.uploadFile(empty, "cvs"));
    }

    @Test
    void uploadFile_noExtension_defaultsToPdf() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "noext", "application/pdf", "hi".getBytes());

        String key = service.uploadFile(file, "misc");

        assertTrue(key.endsWith(".pdf"), "Fallback extension là pdf khi filename không có ext");
    }

    @Test
    void uploadFile_nullFilename_defaultsToPdf() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", null, "application/pdf", "hi".getBytes());

        String key = service.uploadFile(file, "misc");
        assertTrue(key.endsWith(".pdf"));
    }

    @Test
    void uploadFile_multipleUploads_uniqueKeys() throws IOException {
        MockMultipartFile f1 = new MockMultipartFile("file", "a.pdf", "application/pdf", "a".getBytes());
        MockMultipartFile f2 = new MockMultipartFile("file", "a.pdf", "application/pdf", "b".getBytes());

        String k1 = service.uploadFile(f1, "cvs");
        String k2 = service.uploadFile(f2, "cvs");

        org.junit.jupiter.api.Assertions.assertNotEquals(k1, k2,
                "Mỗi upload có UUID + timestamp riêng → key unique");
    }

    // ── deleteFile ──────────────────────────────────────────────────────

    @Test
    void deleteFile_existing_removesFile() throws IOException {
        MockMultipartFile f = new MockMultipartFile("file", "a.pdf", "application/pdf", "x".getBytes());
        String key = service.uploadFile(f, "cvs");
        assertTrue(Files.exists(Paths.get("uploads", key)));

        service.deleteFile(key);

        assertFalse(Files.exists(Paths.get("uploads", key)));
    }

    @Test
    void deleteFile_nonExisting_doesNotThrow() {
        // Idempotent — Files.deleteIfExists handles missing files silently
        service.deleteFile("cvs/does-not-exist.pdf");
    }

    // ── getPreSignedUrl ─────────────────────────────────────────────────

    @Test
    void getPreSignedUrl_returnsLocalFilesPath() {
        String url = service.getPreSignedUrl("cvs/user_1/abc.pdf");
        assertEquals("/api/files/cvs/user_1/abc.pdf", url);
    }

    // ── generateCvS3Key ─────────────────────────────────────────────────

    @Test
    void generateCvS3Key_includesUserIdAndExtension() {
        String key = service.generateCvS3Key(42L, "my-cv.docx");

        assertTrue(key.startsWith("cvs/user_42/"));
        assertTrue(key.endsWith(".docx"));
    }

    @Test
    void generateCvS3Key_noExtension_defaultsPdf() {
        String key = service.generateCvS3Key(42L, "anonymous");
        assertTrue(key.endsWith(".pdf"));
    }

    @Test
    void generateCvS3Key_uniquePerCall() {
        String k1 = service.generateCvS3Key(42L, "cv.pdf");
        String k2 = service.generateCvS3Key(42L, "cv.pdf");
        org.junit.jupiter.api.Assertions.assertNotEquals(k1, k2);
    }
}

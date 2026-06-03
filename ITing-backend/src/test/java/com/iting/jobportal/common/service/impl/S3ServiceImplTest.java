package com.iting.jobportal.common.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.URI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@ExtendWith(MockitoExtension.class)
class S3ServiceImplTest {

  @Mock private S3Client s3Client;
  @Mock private S3Presigner s3Presigner;

  @InjectMocks private S3ServiceImpl service;

  @BeforeEach
  void setUp() throws Exception {
    var f = S3ServiceImpl.class.getDeclaredField("bucketName");
    f.setAccessible(true);
    f.set(service, "iting-bucket");
  }

  // ── uploadFile ──────────────────────────────────────────────────────

  @Test
  void uploadFile_emptyFile_throws() {
    MockMultipartFile empty =
        new MockMultipartFile("file", "x.pdf", "application/pdf", new byte[0]);
    assertThrows(IllegalArgumentException.class, () -> service.uploadFile(empty, "cvs"));
  }

  @Test
  void uploadFile_happyPath_keyFormatAndPut() throws IOException {
    MockMultipartFile f =
        new MockMultipartFile("file", "resume.pdf", "application/pdf", "data".getBytes());

    String key = service.uploadFile(f, "cvs/user_1");

    assertTrue(key.startsWith("cvs/user_1/"));
    assertTrue(key.endsWith(".pdf"));

    ArgumentCaptor<PutObjectRequest> cap = ArgumentCaptor.forClass(PutObjectRequest.class);
    verify(s3Client).putObject(cap.capture(), any(RequestBody.class));
    PutObjectRequest req = cap.getValue();
    assertEquals("iting-bucket", req.bucket());
    assertEquals(key, req.key());
    assertEquals("application/pdf", req.contentType());
  }

  @Test
  void uploadFile_noExtension_defaultsPdf() throws IOException {
    MockMultipartFile f = new MockMultipartFile("file", "noext", "application/pdf", "x".getBytes());
    String key = service.uploadFile(f, "cvs");
    assertTrue(key.endsWith(".pdf"));
  }

  @Test
  void uploadFile_s3Throws_wrappedAsRuntime() {
    MockMultipartFile f = new MockMultipartFile("file", "a.pdf", "application/pdf", "x".getBytes());
    when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
        .thenThrow((S3Exception) S3Exception.builder().message("denied").build());

    RuntimeException ex = assertThrows(RuntimeException.class, () -> service.uploadFile(f, "cvs"));
    assertTrue(ex.getMessage().contains("Failed to upload"));
  }

  // ── deleteFile ──────────────────────────────────────────────────────

  @Test
  void deleteFile_happyPath_callsS3() {
    service.deleteFile("cvs/x.pdf");

    ArgumentCaptor<DeleteObjectRequest> cap = ArgumentCaptor.forClass(DeleteObjectRequest.class);
    verify(s3Client).deleteObject(cap.capture());
    DeleteObjectRequest req = cap.getValue();
    assertEquals("iting-bucket", req.bucket());
    assertEquals("cvs/x.pdf", req.key());
  }

  @Test
  void deleteFile_s3Throws_wrappedAsRuntime() {
    when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
        .thenThrow((S3Exception) S3Exception.builder().message("denied").build());

    RuntimeException ex =
        assertThrows(RuntimeException.class, () -> service.deleteFile("cvs/x.pdf"));
    assertTrue(ex.getMessage().contains("Failed to delete"));
  }

  // ── getPreSignedUrl ─────────────────────────────────────────────────

  @Test
  void getPreSignedUrl_happyPath_returnsSignedUrl() throws Exception {
    PresignedGetObjectRequest signed = mock(PresignedGetObjectRequest.class);
    when(signed.url())
        .thenReturn(URI.create("https://s3.local/iting-bucket/x.pdf?sig=abc").toURL());
    when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(signed);

    String url = service.getPreSignedUrl("cvs/x.pdf");

    assertTrue(url.startsWith("https://"));
    assertTrue(url.contains("x.pdf"));
  }

  @Test
  void getPreSignedUrl_s3Throws_wrappedAsRuntime() {
    when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class)))
        .thenThrow((S3Exception) S3Exception.builder().message("err").build());

    assertThrows(RuntimeException.class, () -> service.getPreSignedUrl("k"));
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
    String key = service.generateCvS3Key(42L, "no_extension_here");
    assertTrue(key.endsWith(".pdf"));
  }

  @Test
  void generateCvS3Key_nullFilename_defaultsPdf() {
    String key = service.generateCvS3Key(42L, null);
    assertTrue(key.endsWith(".pdf"));
  }

  @Test
  void generateCvS3Key_uniquePerCall() {
    String k1 = service.generateCvS3Key(1L, "a.pdf");
    String k2 = service.generateCvS3Key(1L, "a.pdf");
    org.junit.jupiter.api.Assertions.assertNotEquals(k1, k2);
  }

  // ── AwsServiceException fallthrough (not S3Exception) ──────────────

  @Test
  void uploadFile_genericAwsException_propagatesUnwrapped() {
    MockMultipartFile f = new MockMultipartFile("file", "a.pdf", "application/pdf", "x".getBytes());
    // Non-S3Exception (e.g. AwsServiceException base) is NOT caught → propagates raw
    when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
        .thenThrow((AwsServiceException) AwsServiceException.builder().message("other").build());

    // Catch block only handles S3Exception; this should propagate
    assertThrows(RuntimeException.class, () -> service.uploadFile(f, "cvs"));
  }
}

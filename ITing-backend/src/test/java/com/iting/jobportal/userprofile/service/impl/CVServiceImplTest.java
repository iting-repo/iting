package com.iting.jobportal.userprofile.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.S3Service;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.response.CVResponse;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.embedding.HuggingFaceCvExtractionClient;
import com.iting.jobportal.userprofile.service.embedding.HuggingFaceCvExtractionClient.CvExtractionResult;
import jakarta.persistence.EntityManager;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class CVServiceImplTest {

  @Mock private CVRepository cvRepository;
  @Mock private UserProfileRepository userProfileRepository;
  @Mock private UserRepository userRepository;
  @Mock private S3Service s3Service;
  @Mock private EntityManager entityManager;
  @Mock private HuggingFaceCvExtractionClient hfCvExtractionClient;

  @InjectMocks private CVServiceImpl service;

  private UserProfile profile;
  private final ObjectMapper realMapper = new ObjectMapper();

  @BeforeEach
  void setUp() throws Exception {
    // Inject real ObjectMapper so JSON serialization works
    var field = CVServiceImpl.class.getDeclaredField("objectMapper");
    field.setAccessible(true);
    field.set(service, realMapper);

    profile = new UserProfile();
    profile.setId(1L);
  }

  private MockMultipartFile mockPdf() {
    return new MockMultipartFile("file", "cv.pdf", "application/pdf", "data".getBytes());
  }

  // ── getRecentCVs ────────────────────────────────────────────────────

  @Test
  void getRecentCVs_noProfile_returnsEmpty() {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.empty());

    List<CVResponse> result = service.getRecentCVs(1L);

    assertTrue(result.isEmpty());
    verify(cvRepository, never())
        .findTop3ByProfileIdOrderByUploadedAtDesc(any(), any(Pageable.class));
  }

  @Test
  void getRecentCVs_returnsMapped() {
    CV cv =
        CV.builder()
            .id(10L)
            .title("Senior CV")
            .fileName("cv.pdf")
            .fileUrl("/url")
            .uploadedAt(LocalDateTime.now())
            .build();
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.findTop3ByProfileIdOrderByUploadedAtDesc(eq(1L), any(Pageable.class)))
        .thenReturn(List.of(cv));

    List<CVResponse> result = service.getRecentCVs(1L);

    assertEquals(1, result.size());
    assertEquals(10L, result.get(0).getId());
    assertEquals("Senior CV", result.get(0).getTitle());
  }

  // ── uploadCV ────────────────────────────────────────────────────────

  @Test
  void uploadCV_happyPath_savesAndReturnsResponse() throws IOException {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(1L);
    when(s3Service.uploadFile(any(), eq("cvs/user_1"))).thenReturn("cvs/user_1/abc.pdf");
    when(s3Service.getPreSignedUrl("cvs/user_1/abc.pdf"))
        .thenReturn("/api/files/cvs/user_1/abc.pdf");
    when(cvRepository.save(any(CV.class)))
        .thenAnswer(
            inv -> {
              CV c = inv.getArgument(0);
              c.setId(99L);
              return c;
            });
    when(hfCvExtractionClient.extract(any())).thenReturn(Optional.empty());

    CVResponse res = service.uploadCV(1L, mockPdf(), "My CV");

    assertNotNull(res);
    assertEquals(99L, res.getId());
    assertEquals("My CV", res.getTitle());

    // S3 + DB upload happened
    verify(s3Service).uploadFile(any(), eq("cvs/user_1"));
    verify(cvRepository).save(any(CV.class));
    // Limit cleanup NOT triggered (cvCount=1, max=3)
    verify(cvRepository, never()).findFirstByProfile_IdOrderByUploadedAtAsc(any());
  }

  @Test
  void uploadCV_titleNull_usesOriginalFilename() throws IOException {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(0L);
    when(s3Service.uploadFile(any(), anyString())).thenReturn("key");
    when(s3Service.getPreSignedUrl("key")).thenReturn("/url");
    when(cvRepository.save(any(CV.class))).thenAnswer(inv -> inv.getArgument(0));
    when(hfCvExtractionClient.extract(any())).thenReturn(Optional.empty());

    CVResponse res = service.uploadCV(1L, mockPdf(), null);

    assertEquals("cv.pdf", res.getTitle());
  }

  @Test
  void uploadCV_atLimit_triggersOldestDelete() throws IOException {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    // First call returns 3 (at limit) → triggers cleanup
    // The cleanup itself calls countByProfile_Id again (inside manageUserCVLimit)
    when(cvRepository.countByProfile_Id(1L)).thenReturn(3L);

    CV oldest = CV.builder().id(5L).s3Key("cvs/old.pdf").build();
    when(cvRepository.findFirstByProfile_IdOrderByUploadedAtAsc(1L)).thenReturn(oldest);

    when(s3Service.uploadFile(any(), anyString())).thenReturn("new-key");
    when(s3Service.getPreSignedUrl("new-key")).thenReturn("/new-url");
    when(cvRepository.save(any(CV.class)))
        .thenAnswer(
            inv -> {
              CV c = inv.getArgument(0);
              c.setId(99L);
              return c;
            });
    when(hfCvExtractionClient.extract(any())).thenReturn(Optional.empty());

    service.uploadCV(1L, mockPdf(), "x");

    // Oldest CV deleted from S3 + DB
    verify(s3Service).deleteFile("cvs/old.pdf");
    verify(cvRepository).delete(oldest);
  }

  @Test
  void uploadCV_hfReturnsEmbedding_enrichesCv() throws Exception {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(0L);
    when(s3Service.uploadFile(any(), anyString())).thenReturn("key");
    when(s3Service.getPreSignedUrl("key")).thenReturn("/url");
    when(cvRepository.save(any(CV.class)))
        .thenAnswer(
            inv -> {
              CV c = inv.getArgument(0);
              if (c.getId() == null) c.setId(50L);
              return c;
            });

    JsonNode extracted = realMapper.readTree("{\"skills\":[\"Java\"]}");
    CvExtractionResult result =
        new CvExtractionResult("ok", extracted, new double[] {0.1, 0.2, 0.3}, null);
    when(hfCvExtractionClient.extract(any())).thenReturn(Optional.of(result));

    service.uploadCV(1L, mockPdf(), "x");

    // save called at least twice: once for upload, once for enrichment
    ArgumentCaptor<CV> cap = ArgumentCaptor.forClass(CV.class);
    verify(cvRepository, times(2)).save(cap.capture());
    CV last = cap.getAllValues().get(cap.getAllValues().size() - 1);
    assertTrue(last.getExtractedDataJson().contains("Java"));
    assertNotNull(last.getCvEmbedding());
    assertNotNull(last.getEmbeddingUpdatedAt());
  }

  @Test
  void uploadCV_hfNonSuccess_noEnrichment() throws IOException {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(0L);
    when(s3Service.uploadFile(any(), anyString())).thenReturn("key");
    when(s3Service.getPreSignedUrl("key")).thenReturn("/url");
    when(cvRepository.save(any(CV.class)))
        .thenAnswer(
            inv -> {
              CV c = inv.getArgument(0);
              c.setId(50L);
              return c;
            });

    CvExtractionResult bad = new CvExtractionResult("error", null, null, "boom");
    when(hfCvExtractionClient.extract(any())).thenReturn(Optional.of(bad));

    service.uploadCV(1L, mockPdf(), "x");

    // Only the initial save (upload) — no enrichment save
    verify(cvRepository, times(1)).save(any(CV.class));
  }

  @Test
  void uploadCV_hfThrows_uploadStillSucceeds() throws IOException {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(0L);
    when(s3Service.uploadFile(any(), anyString())).thenReturn("key");
    when(s3Service.getPreSignedUrl("key")).thenReturn("/url");
    when(cvRepository.save(any(CV.class)))
        .thenAnswer(
            inv -> {
              CV c = inv.getArgument(0);
              c.setId(50L);
              return c;
            });
    when(hfCvExtractionClient.extract(any())).thenThrow(new RuntimeException("HF down"));

    CVResponse res = service.uploadCV(1L, mockPdf(), "x");

    // Upload succeeds despite HF failure
    assertNotNull(res);
    assertEquals(50L, res.getId());
  }

  // ── manageUserCVLimit ───────────────────────────────────────────────

  @Test
  void manageUserCVLimit_belowLimit_noOp() {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(2L);

    service.manageUserCVLimit(1L);

    verify(cvRepository, never()).findFirstByProfile_IdOrderByUploadedAtAsc(any());
    verify(cvRepository, never()).delete(any());
  }

  @Test
  void manageUserCVLimit_atLimit_deletesOldest() {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(3L);

    CV oldest = CV.builder().id(5L).s3Key("cvs/x.pdf").build();
    when(cvRepository.findFirstByProfile_IdOrderByUploadedAtAsc(1L)).thenReturn(oldest);

    service.manageUserCVLimit(1L);

    verify(s3Service).deleteFile("cvs/x.pdf");
    verify(cvRepository).delete(oldest);
  }

  @Test
  void manageUserCVLimit_atLimit_noS3Key_skipsS3Delete() {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(3L);

    CV oldest = CV.builder().id(5L).s3Key("").build();
    when(cvRepository.findFirstByProfile_IdOrderByUploadedAtAsc(1L)).thenReturn(oldest);

    service.manageUserCVLimit(1L);

    verify(s3Service, never()).deleteFile(any());
    verify(cvRepository).delete(oldest);
  }

  @Test
  void manageUserCVLimit_atLimit_oldestNull_noDelete() {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(3L);
    when(cvRepository.findFirstByProfile_IdOrderByUploadedAtAsc(1L)).thenReturn(null);

    service.manageUserCVLimit(1L);

    verify(cvRepository, never()).delete(any());
    verify(s3Service, never()).deleteFile(any());
  }

  @Test
  void manageUserCVLimit_s3DeleteThrows_stillDeletesFromDb() {
    when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepository.countByProfile_Id(1L)).thenReturn(3L);

    CV oldest = CV.builder().id(5L).s3Key("cvs/x.pdf").build();
    when(cvRepository.findFirstByProfile_IdOrderByUploadedAtAsc(1L)).thenReturn(oldest);
    org.mockito.Mockito.doThrow(new RuntimeException("S3 down"))
        .when(s3Service)
        .deleteFile("cvs/x.pdf");

    service.manageUserCVLimit(1L);

    verify(cvRepository).delete(oldest);
  }
}

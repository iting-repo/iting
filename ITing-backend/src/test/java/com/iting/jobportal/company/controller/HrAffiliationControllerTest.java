package com.iting.jobportal.company.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.iting.jobportal.company.dto.request.InitAffiliationRequest;
import com.iting.jobportal.company.dto.request.UpdateAffiliationBasicInfoRequest;
import com.iting.jobportal.company.dto.response.AffiliationMeResponse;
import com.iting.jobportal.company.dto.response.InitAffiliationResponse;
import com.iting.jobportal.company.service.AffiliationService;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class HrAffiliationControllerTest {

  @Mock private AffiliationService affiliationService;
  @InjectMocks private HrAffiliationController controller;

  // ── init ─────────────────────────────────────────────────────────────

  @Test
  void init_returns201Created() {
    InitAffiliationRequest req = new InitAffiliationRequest();
    InitAffiliationResponse expected = new InitAffiliationResponse();
    when(affiliationService.init(99L, req)).thenReturn(expected);

    ResponseEntity<InitAffiliationResponse> resp = controller.init(99L, req);

    assertEquals(HttpStatus.CREATED, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  // ── getMe ────────────────────────────────────────────────────────────

  @Test
  void getMe_present_returnsOk() {
    AffiliationMeResponse expected = new AffiliationMeResponse();
    when(affiliationService.getMe(99L)).thenReturn(Optional.of(expected));

    ResponseEntity<AffiliationMeResponse> resp = controller.getMe(99L);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void getMe_absent_returns204NoContent() {
    when(affiliationService.getMe(99L)).thenReturn(Optional.empty());

    ResponseEntity<AffiliationMeResponse> resp = controller.getMe(99L);

    assertEquals(HttpStatus.NO_CONTENT, resp.getStatusCode());
  }

  // ── updateBasicInfo / submitReview ──────────────────────────────────

  @Test
  void updateBasicInfo_delegates() {
    UpdateAffiliationBasicInfoRequest req = new UpdateAffiliationBasicInfoRequest();
    AffiliationMeResponse expected = new AffiliationMeResponse();
    when(affiliationService.updateBasicInfo(99L, req)).thenReturn(expected);

    assertSame(expected, controller.updateBasicInfo(99L, req).getBody());
  }

  @Test
  void submitReview_delegates() {
    AffiliationMeResponse expected = new AffiliationMeResponse();
    when(affiliationService.submitReview(99L)).thenReturn(expected);

    assertSame(expected, controller.submitReview(99L).getBody());
  }

  // ── uploads: logo / license / consent ───────────────────────────────

  @Test
  void uploadLogo_returnsUrl() {
    MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", new byte[100]);
    when(affiliationService.uploadLogo(eq(99L), any(MultipartFile.class)))
        .thenReturn("https://s3/logo");

    ResponseEntity<Map<String, String>> resp = controller.uploadLogo(99L, file);

    assertEquals("https://s3/logo", resp.getBody().get("url"));
  }

  @Test
  void uploadLicense_returnsUrl() {
    MockMultipartFile file =
        new MockMultipartFile("file", "lic.pdf", "application/pdf", new byte[100]);
    when(affiliationService.uploadLicense(eq(99L), any(MultipartFile.class)))
        .thenReturn("https://s3/license");

    ResponseEntity<Map<String, String>> resp = controller.uploadLicense(99L, file);

    assertEquals("https://s3/license", resp.getBody().get("url"));
  }

  @Test
  void uploadConsent_confirmedTrue_passesConfirmedFlag() {
    MockMultipartFile file =
        new MockMultipartFile("file", "consent.pdf", "application/pdf", new byte[100]);
    when(affiliationService.uploadConsent(eq(99L), any(MultipartFile.class), eq(true)))
        .thenReturn("https://s3/consent");

    ResponseEntity<Map<String, String>> resp = controller.uploadConsent(99L, file, "true");

    assertEquals("https://s3/consent", resp.getBody().get("url"));
  }

  @Test
  void uploadConsent_confirmedFalse_orMissing() {
    MockMultipartFile file =
        new MockMultipartFile("file", "consent.pdf", "application/pdf", new byte[100]);
    when(affiliationService.uploadConsent(eq(99L), any(MultipartFile.class), eq(false)))
        .thenReturn("https://s3/consent");

    controller.uploadConsent(99L, file, "false");
    // Also null → false
    controller.uploadConsent(99L, file, null);

    org.mockito.Mockito.verify(affiliationService, org.mockito.Mockito.times(2))
        .uploadConsent(eq(99L), any(MultipartFile.class), eq(false));
  }

  // ── presigned URL views (license / logo / consent) ─────────────────

  @Test
  void viewLicense_returnsPresignedUrl_15min() {
    when(affiliationService.getLicensePresignedUrl(99L, 15)).thenReturn("https://s3/license");
    assertEquals("https://s3/license", controller.viewLicense(99L).getBody().get("url"));
  }

  @Test
  void viewLogo_returnsPresignedUrl_15min() {
    when(affiliationService.getLogoPresignedUrl(99L, 15)).thenReturn("https://s3/logo");
    assertEquals("https://s3/logo", controller.viewLogo(99L).getBody().get("url"));
  }

  @Test
  void viewConsent_returnsPresignedUrl_15min() {
    when(affiliationService.getConsentPresignedUrl(99L, 15)).thenReturn("https://s3/consent");
    assertEquals("https://s3/consent", controller.viewConsent(99L).getBody().get("url"));
  }
}

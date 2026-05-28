package com.iting.jobportal.company.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RedisRateLimitingService;
import com.iting.jobportal.company.dto.request.*;
import com.iting.jobportal.company.dto.response.BusinessLicenseFormResponse;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.company.service.CompanyService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class CompanyControllerTest {

  @Mock private CompanyService companyService;
  @Mock private CompanyFollowService companyFollowService;
  @Mock private RedisRateLimitingService rateLimit;
  @Mock private ObjectProvider<RedisRateLimitingService> rateLimitProvider;

  private CompanyController newController(boolean rateLimitAvailable) {
    when(rateLimitProvider.getIfAvailable()).thenReturn(rateLimitAvailable ? rateLimit : null);
    return new CompanyController(companyService, companyFollowService, rateLimitProvider);
  }

  // ── view business license ───────────────────────────────────────────

  @Test
  void viewBusinessLicense_returnsPresignedUrl() {
    CompanyController c = newController(false);
    when(companyService.getBusinessLicensePresignedUrlByAccountId(1L, 15))
        .thenReturn("https://s3/license");

    ResponseEntity<Map<String, String>> resp = c.viewBusinessLicense(1L);
    assertEquals("https://s3/license", resp.getBody().get("url"));
  }

  // ── consent document multipart upload ───────────────────────────────

  @Test
  void uploadConsentDocument_multipart_passesAllFields() {
    CompanyController c = newController(false);
    MockMultipartFile file =
        new MockMultipartFile("file", "consent.pdf", "application/pdf", new byte[100]);
    CompanyResponse expected = new CompanyResponse();
    when(companyService.updateConsentDocumentByAccountId(
            any(), any(ConsentDocumentUploadRequest.class)))
        .thenReturn(expected);

    ResponseEntity<CompanyResponse> resp = c.uploadConsentDocument(1L, file, true, "v1");

    assertSame(expected, resp.getBody());
  }

  @Test
  void uploadConsentDocument_jsonBody_passesRequest() {
    CompanyController c = newController(false);
    ConsentDocumentUploadRequest req = new ConsentDocumentUploadRequest();
    CompanyResponse expected = new CompanyResponse();
    when(companyService.updateConsentDocumentByAccountId(1L, req)).thenReturn(expected);

    assertSame(expected, c.uploadConsentDocument(1L, req).getBody());
  }

  // ── getMyCompany / updateBasicInfo / updateRepresentative ──────────

  @Test
  void getMyCompany_delegates() {
    CompanyController c = newController(false);
    CompanyResponse expected = new CompanyResponse();
    when(companyService.getMyCompany(1L)).thenReturn(expected);

    assertSame(expected, c.getMyCompany(1L).getBody());
  }

  @Test
  void updateBasicInfo_delegates() {
    CompanyController c = newController(false);
    CompanyBasicInfoRequest req = new CompanyBasicInfoRequest();
    CompanyResponse expected = new CompanyResponse();
    when(companyService.updateBasicInfoByAccountId(1L, req)).thenReturn(expected);

    assertSame(expected, c.updateBasicInfo(1L, req).getBody());
  }

  @Test
  void updateRepresentative_delegates() {
    CompanyController c = newController(false);
    CompanyRepresentativeRequest req = new CompanyRepresentativeRequest();
    CompanyResponse expected = new CompanyResponse();
    when(companyService.updateRepresentativeByAccountId(1L, req)).thenReturn(expected);

    assertSame(expected, c.updateRepresentative(1L, req).getBody());
  }

  // ── business license ────────────────────────────────────────────────

  @Test
  void getBusinessLicenseForm_delegates() {
    CompanyController c = newController(false);
    BusinessLicenseFormResponse expected =
        new BusinessLicenseFormResponse(1L, null, null, null, null);
    when(companyService.getBusinessLicenseFormByAccountId(1L)).thenReturn(expected);

    assertSame(expected, c.getBusinessLicenseForm(1L).getBody());
  }

  @Test
  void updateBusinessLicense_wrapsFileInRequest() {
    CompanyController c = newController(false);
    MockMultipartFile file =
        new MockMultipartFile("file", "license.pdf", "application/pdf", new byte[100]);
    CompanyResponse expected = new CompanyResponse();
    when(companyService.updateBusinessLicenseByAccountId(
            any(), any(BusinessLicenseUploadRequest.class)))
        .thenReturn(expected);

    assertSame(expected, c.updateBusinessLicense(1L, file).getBody());
  }

  // ── phone verification ─────────────────────────────────────────────

  @Test
  void verifyPhone_callsServiceAndReturnsSuccessString() {
    CompanyController c = newController(false);
    VerifyPhoneRequest req = new VerifyPhoneRequest();

    ResponseEntity<String> resp = c.verifyPhone(1L, req);

    verify(companyService).verifyPhoneByAccountId(1L, req);
    assertEquals("Phone verified successfully", resp.getBody());
  }

  @Test
  void sendPhoneOtp_returnsExpiresInSeconds() {
    CompanyController c = newController(false);
    com.iting.jobportal.company.dto.request.SendPhoneOtpRequest req =
        new com.iting.jobportal.company.dto.request.SendPhoneOtpRequest();
    req.setPhone("0901234567");

    ResponseEntity<Map<String, Object>> resp = c.sendPhoneOtp(1L, req);

    verify(companyService).sendPhoneOtpByAccountId(1L, "0901234567");
    assertEquals(300, resp.getBody().get("expiresInSeconds"));
  }

  // ── social links ────────────────────────────────────────────────────

  @Test
  void getMySocialLinks_delegates() {
    CompanyController c = newController(false);
    List<CompanySocialLinkDto> links = List.of();
    when(companyService.getMySocialLinks(1L)).thenReturn(links);

    assertSame(links, c.getMySocialLinks(1L).getBody());
  }

  @Test
  void updateMySocialLinks_replacesAll() {
    CompanyController c = newController(false);
    List<CompanySocialLinkDto> links = List.of();
    when(companyService.updateMySocialLinks(1L, links)).thenReturn(links);

    assertSame(links, c.updateMySocialLinks(1L, links).getBody());
  }

  // ── verify license ──────────────────────────────────────────────────

  @Test
  void verifyLicense_delegates() {
    CompanyController c = newController(false);
    VerifyLicenseRequest req = new VerifyLicenseRequest();
    CompanyResponse expected = new CompanyResponse();
    when(companyService.verifyLicenseByAccountId(1L, req)).thenReturn(expected);

    assertSame(expected, c.verifyLicense(1L, req).getBody());
  }

  // ── follower count ─────────────────────────────────────────────────

  @Test
  void getMyFollowerCount_fetchesCompanyThenCount() {
    CompanyController c = newController(false);
    CompanyResponse myCo = new CompanyResponse();
    myCo.setId(10L);
    when(companyService.getMyCompany(1L)).thenReturn(myCo);
    when(companyFollowService.getFollowerCount(10L)).thenReturn(50L);

    ResponseEntity<Map<String, Long>> resp = c.getMyFollowerCount(1L);
    assertEquals(50L, resp.getBody().get("followerCount"));
  }

  // ── submit reviews (info / document / business-license / consent) ──

  @Test
  void submitInfoReview_rateLimitAllowed_callsService() {
    CompanyController c = newController(true);
    when(rateLimit.tryConsume(RateLimitPolicy.AI_REVIEW, "1")).thenReturn(true);

    c.submitInfoReview(1L);

    verify(companyService).submitInfoReviewByAccountId(1L);
  }

  @Test
  void submitInfoReview_rateLimitExceeded_returns429() {
    CompanyController c = newController(true);
    when(rateLimit.tryConsume(RateLimitPolicy.AI_REVIEW, "1")).thenReturn(false);

    ResponseEntity<?> resp = c.submitInfoReview(1L);

    assertEquals(HttpStatus.TOO_MANY_REQUESTS, resp.getStatusCode());
    verify(companyService, org.mockito.Mockito.never()).submitInfoReviewByAccountId(any());
  }

  @Test
  void submitInfoReview_rateLimitNullProvider_skipsCheck_callsService() {
    CompanyController c = newController(false); // provider returns null

    c.submitInfoReview(1L);

    verify(companyService).submitInfoReviewByAccountId(1L);
  }

  @Test
  void submitDocumentReview_delegates() {
    CompanyController c = newController(false);
    CompanyResponse expected = new CompanyResponse();
    when(companyService.submitDocumentReviewByAccountId(1L)).thenReturn(expected);

    assertSame(expected, c.submitDocumentReview(1L).getBody());
  }

  @Test
  void submitBusinessLicenseReview_delegates() {
    CompanyController c = newController(false);
    CompanyResponse expected = new CompanyResponse();
    when(companyService.submitBusinessLicenseReviewByAccountId(1L)).thenReturn(expected);

    assertSame(expected, c.submitBusinessLicenseReview(1L).getBody());
  }

  @Test
  void submitConsentDocumentReview_delegates() {
    CompanyController c = newController(false);
    CompanyResponse expected = new CompanyResponse();
    when(companyService.submitConsentDocumentReviewByAccountId(1L)).thenReturn(expected);

    assertSame(expected, c.submitConsentDocumentReview(1L).getBody());
  }

  // ── upload logo ─────────────────────────────────────────────────────

  @Test
  void uploadLogo_returnsLogoUrl() {
    CompanyController c = newController(false);
    MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", new byte[100]);
    when(companyService.uploadLogoByAccountId(any(), any(MultipartFile.class)))
        .thenReturn("https://s3/logo.png");

    ResponseEntity<Map<String, String>> resp = c.uploadLogo(1L, file);

    assertEquals("https://s3/logo.png", resp.getBody().get("logoUrl"));
  }
}

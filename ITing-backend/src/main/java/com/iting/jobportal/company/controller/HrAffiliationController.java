package com.iting.jobportal.company.controller;

import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RateLimited;
import com.iting.jobportal.company.dto.request.InitAffiliationRequest;
import com.iting.jobportal.company.dto.request.UpdateAffiliationBasicInfoRequest;
import com.iting.jobportal.company.dto.response.AffiliationMeResponse;
import com.iting.jobportal.company.dto.response.InitAffiliationResponse;
import com.iting.jobportal.company.service.AffiliationService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * HR-side endpoints quản lý affiliation của HR đang login. Mọi endpoint dưới
 * /api/hr/affiliations/me/... đều require role EMPLOYER.
 */
@Tag(name = "10. HR Affiliation")
@RestController
@RequestMapping("/api/hr/affiliations/me")
@PreAuthorize("hasRole('EMPLOYER')")
@RequiredArgsConstructor
public class HrAffiliationController {

  private final AffiliationService affiliationService;

  @PostMapping("/init")
  @Operation(
      summary =
          "Khởi tạo affiliation: tạo Company DRAFT (nếu taxCode chưa có) hoặc join Company"
              + " existing")
  public ResponseEntity<InitAffiliationResponse> init(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @Valid @RequestBody InitAffiliationRequest request) {
    InitAffiliationResponse resp = affiliationService.init(hrAccountId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(resp);
  }

  @GetMapping
  @Operation(summary = "Trạng thái + snapshot affiliation của HR đang login")
  public ResponseEntity<AffiliationMeResponse> getMe(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return affiliationService
        .getMe(hrAccountId)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.noContent().build());
  }

  @PutMapping("/basic-info")
  @Operation(
      summary = "Cập nhật snapshot fields (name, description, website...). KHÔNG ghi vào Company.")
  public ResponseEntity<AffiliationMeResponse> updateBasicInfo(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @Valid @RequestBody UpdateAffiliationBasicInfoRequest request) {
    return ResponseEntity.ok(affiliationService.updateBasicInfo(hrAccountId, request));
  }

  @PostMapping(value = "/logo/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Upload logo vào snapshot affiliation")
  @RateLimited(policy = RateLimitPolicy.FILE_UPLOAD, subject = "user")
  public ResponseEntity<Map<String, String>> uploadLogo(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @RequestPart("file") MultipartFile file) {
    String url = affiliationService.uploadLogo(hrAccountId, file);
    return ResponseEntity.ok(Map.of("url", url));
  }

  @PostMapping(value = "/license/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Upload giấy phép kinh doanh vào snapshot affiliation")
  @RateLimited(policy = RateLimitPolicy.FILE_UPLOAD, subject = "user")
  public ResponseEntity<Map<String, String>> uploadLicense(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @RequestPart("file") MultipartFile file) {
    String url = affiliationService.uploadLicense(hrAccountId, file);
    return ResponseEntity.ok(Map.of("url", url));
  }

  @PostMapping(value = "/consent/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Upload văn bản thỏa thuận xử lý DLCN vào snapshot affiliation")
  @RateLimited(policy = RateLimitPolicy.FILE_UPLOAD, subject = "user")
  public ResponseEntity<Map<String, String>> uploadConsent(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @RequestPart("file") MultipartFile file,
      @RequestPart(value = "confirmed", required = false) String confirmed) {
    boolean isConfirmed = "true".equalsIgnoreCase(confirmed);
    String url = affiliationService.uploadConsent(hrAccountId, file, isConfirmed);
    return ResponseEntity.ok(Map.of("url", url));
  }

  @PostMapping("/submit-review")
  @Operation(summary = "Gửi snapshot cho admin duyệt. Set submissionStatus=PENDING_REVIEW.")
  public ResponseEntity<AffiliationMeResponse> submitReview(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return ResponseEntity.ok(affiliationService.submitReview(hrAccountId));
  }

  @PostMapping("/submit-info")
  @Operation(summary = "Gửi RIÊNG phần thông tin công ty cho admin duyệt (info_status).")
  public ResponseEntity<AffiliationMeResponse> submitInfo(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return ResponseEntity.ok(affiliationService.submitInfo(hrAccountId));
  }

  @PostMapping("/submit-license")
  @Operation(summary = "Gửi RIÊNG phần giấy phép kinh doanh cho admin duyệt (license_status).")
  public ResponseEntity<AffiliationMeResponse> submitLicense(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return ResponseEntity.ok(affiliationService.submitLicense(hrAccountId));
  }

  @PostMapping("/submit-consent")
  @Operation(summary = "Gửi RIÊNG phần thỏa thuận DLCN cho admin duyệt (consent_status).")
  public ResponseEntity<AffiliationMeResponse> submitConsent(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return ResponseEntity.ok(affiliationService.submitConsent(hrAccountId));
  }

  @GetMapping("/license/view")
  @Operation(summary = "Presigned URL self-check cho HR xem lại license đã upload")
  public ResponseEntity<Map<String, String>> viewLicense(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return ResponseEntity.ok(
        Map.of("url", affiliationService.getLicensePresignedUrl(hrAccountId, 15)));
  }

  @GetMapping("/logo/view")
  @Operation(summary = "Presigned URL self-check cho HR xem lại logo đã upload")
  public ResponseEntity<Map<String, String>> viewLogo(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return ResponseEntity.ok(
        Map.of("url", affiliationService.getLogoPresignedUrl(hrAccountId, 15)));
  }

  @GetMapping("/consent/view")
  @Operation(summary = "Presigned URL self-check cho HR xem lại văn bản thỏa thuận đã upload")
  public ResponseEntity<Map<String, String>> viewConsent(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId) {
    return ResponseEntity.ok(
        Map.of("url", affiliationService.getConsentPresignedUrl(hrAccountId, 15)));
  }
}

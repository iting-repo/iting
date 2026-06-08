package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.request.CreateOfferRequest;
import com.iting.jobportal.application.dto.response.OfferResponse;
import com.iting.jobportal.application.service.OfferService;
import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RateLimited;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "08.2 HR Offer Letter", description = "HR-side offer letter management")
@RestController
@RequestMapping("/api/hr/offers")
@PreAuthorize("hasRole('EMPLOYER')")
@RequiredArgsConstructor
public class HrOfferController {

  private final OfferService offerService;

  @PostMapping
  @Operation(
      summary = "Tạo + gửi offer cho 1 application. Auto-generate PDF + send email/notification.")
  public ResponseEntity<OfferResponse> create(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @Valid @RequestBody CreateOfferRequest request) {
    return ResponseEntity.ok(offerService.create(hrAccountId, request));
  }

  @PostMapping(value = "/upload-letter", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @RateLimited(policy = RateLimitPolicy.FILE_UPLOAD, subject = "user")
  @Operation(
      summary =
          "Upload file offer letter PDF tự soạn. Trả {url} để truyền vào offerLetterUrl khi tạo offer.")
  public ResponseEntity<Map<String, String>> uploadLetter(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @RequestPart("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", offerService.uploadOfferLetter(hrAccountId, file)));
  }

  @PostMapping("/{offerId}/revoke")
  @Operation(summary = "HR thu hồi offer đang chờ (chỉ owner hoặc admin company).")
  public ResponseEntity<OfferResponse> revoke(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId, @PathVariable Long offerId) {
    return ResponseEntity.ok(offerService.revoke(hrAccountId, offerId));
  }

  @GetMapping("/{offerId}")
  @Operation(summary = "Chi tiết offer (HR view).")
  public ResponseEntity<OfferResponse> get(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId, @PathVariable Long offerId) {
    return ResponseEntity.ok(offerService.getById(hrAccountId, offerId, true));
  }

  @GetMapping("/{offerId}/pdf/view")
  @Operation(summary = "Presigned URL xem PDF (15 phút).")
  public ResponseEntity<Map<String, String>> viewPdf(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId, @PathVariable Long offerId) {
    return ResponseEntity.ok(
        Map.of("url", offerService.getPdfPresignedUrl(hrAccountId, offerId, true)));
  }

  @GetMapping("/by-application")
  @Operation(summary = "List offer của 1 application (theo applyFormId + jobId).")
  public ResponseEntity<List<OfferResponse>> listByApplication(
      @Parameter(hidden = true) @CurrentUser Long hrAccountId,
      @RequestParam Long applyFormId,
      @RequestParam Long jobId) {
    return ResponseEntity.ok(offerService.listByApplication(hrAccountId, applyFormId, jobId));
  }
}

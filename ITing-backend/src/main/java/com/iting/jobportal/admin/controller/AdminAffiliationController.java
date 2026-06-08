package com.iting.jobportal.admin.controller;

import com.iting.jobportal.company.dto.request.AffiliationRejectRequest;
import com.iting.jobportal.company.dto.request.ApplyAffiliationToCompanyRequest;
import com.iting.jobportal.company.dto.request.AssignCompanyRequest;
import com.iting.jobportal.company.dto.response.AdminAffiliationResponse;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import com.iting.jobportal.company.service.AdminAffiliationService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Admin-side endpoints duyệt / reject / áp snapshot lên Company / revoke affiliation. */
@Tag(name = "11. Admin Affiliation")
@RestController
@RequestMapping("/api/admin/affiliations")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAffiliationController {

  private final AdminAffiliationService adminAffiliationService;

  @GetMapping
  @Operation(summary = "List affiliation + filter")
  public ResponseEntity<Page<AdminAffiliationResponse>> list(
      @RequestParam(required = false) AffiliationStatus status,
      @RequestParam(required = false) SubmissionStatus submissionStatus,
      @RequestParam(required = false) Long companyId,
      @RequestParam(required = false) Long hrAccountId,
      @RequestParam(required = false) String hrEmail,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(defaultValue = "id,desc") String sort) {
    Sort sortObj = parseSort(sort);
    Page<AdminAffiliationResponse> result =
        adminAffiliationService.list(
            status,
            submissionStatus,
            companyId,
            hrAccountId,
            hrEmail,
            PageRequest.of(page, size, sortObj));
    return ResponseEntity.ok(result);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Chi tiết affiliation: HR + Company hiện tại + snapshot HR")
  public ResponseEntity<AdminAffiliationResponse> getDetail(@PathVariable Long id) {
    return ResponseEntity.ok(adminAffiliationService.getDetail(id));
  }

  @GetMapping("/{id}/license/view")
  @Operation(summary = "Presigned URL xem giấy phép HR đã submit")
  public ResponseEntity<Map<String, String>> viewLicense(@PathVariable Long id) {
    return ResponseEntity.ok(Map.of("url", adminAffiliationService.getLicensePresignedUrl(id, 15)));
  }

  @GetMapping("/{id}/logo/view")
  @Operation(summary = "Presigned URL xem logo HR đã submit")
  public ResponseEntity<Map<String, String>> viewLogo(@PathVariable Long id) {
    return ResponseEntity.ok(Map.of("url", adminAffiliationService.getLogoPresignedUrl(id, 15)));
  }

  @GetMapping("/{id}/consent/view")
  @Operation(summary = "Presigned URL xem văn bản thỏa thuận DLCN HR đã submit")
  public ResponseEntity<Map<String, String>> viewConsent(@PathVariable Long id) {
    return ResponseEntity.ok(Map.of("url", adminAffiliationService.getConsentPresignedUrl(id, 15)));
  }

  @PostMapping("/{id}/approve")
  @Operation(
      summary =
          "Duyệt submission. Auto-apply snapshot lên Company nếu là affiliation đầu tiên APPROVED.")
  public ResponseEntity<AdminAffiliationResponse> approve(
      @PathVariable Long id, @Parameter(hidden = true) @CurrentUser Long adminAccountId) {
    return ResponseEntity.ok(adminAffiliationService.approve(id, adminAccountId));
  }

  @PostMapping("/{id}/reject")
  @Operation(summary = "Reject submission. Lần đầu (PENDING) → membership cũng REJECTED.")
  public ResponseEntity<AdminAffiliationResponse> reject(
      @PathVariable Long id,
      @Parameter(hidden = true) @CurrentUser Long adminAccountId,
      @Valid @RequestBody AffiliationRejectRequest body) {
    return ResponseEntity.ok(adminAffiliationService.reject(id, adminAccountId, body.getReason()));
  }

  @PostMapping("/{id}/parts/{part}/approve")
  @Operation(summary = "Duyệt RIÊNG 1 phần (part = info|license|consent).")
  public ResponseEntity<AdminAffiliationResponse> approvePart(
      @PathVariable Long id,
      @PathVariable String part,
      @Parameter(hidden = true) @CurrentUser Long adminAccountId) {
    return ResponseEntity.ok(adminAffiliationService.approvePart(id, part, adminAccountId));
  }

  @PostMapping("/{id}/parts/{part}/reject")
  @Operation(summary = "Từ chối RIÊNG 1 phần (part = info|license|consent) + lý do.")
  public ResponseEntity<AdminAffiliationResponse> rejectPart(
      @PathVariable Long id,
      @PathVariable String part,
      @Parameter(hidden = true) @CurrentUser Long adminAccountId,
      @Valid @RequestBody AffiliationRejectRequest body) {
    return ResponseEntity.ok(
        adminAffiliationService.rejectPart(id, part, adminAccountId, body.getReason()));
  }

  @PostMapping("/{id}/assign-company")
  @Operation(
      summary =
          "Gán HR vào một công ty cụ thể (ghi đè). Yêu cầu cả 3 phần đã APPROVED. Apply snapshot.")
  public ResponseEntity<AdminAffiliationResponse> assignCompany(
      @PathVariable Long id,
      @Parameter(hidden = true) @CurrentUser Long adminAccountId,
      @Valid @RequestBody AssignCompanyRequest body) {
    return ResponseEntity.ok(
        adminAffiliationService.assignToCompany(id, body.getCompanyId(), adminAccountId));
  }

  @PostMapping("/{id}/apply-to-company")
  @Operation(summary = "Áp snapshot lên Company (luồng tổng đài). Yêu cầu submission đã APPROVED.")
  public ResponseEntity<AdminAffiliationResponse> applyToCompany(
      @PathVariable Long id,
      @Parameter(hidden = true) @CurrentUser Long adminAccountId,
      @Valid @RequestBody ApplyAffiliationToCompanyRequest body) {
    return ResponseEntity.ok(
        adminAffiliationService.applyToCompany(
            id, adminAccountId, body.getVerifiedHrEmail(), body.getContactNote()));
  }

  @PostMapping("/{id}/revoke")
  @Operation(summary = "Thu hồi membership sau khi đã APPROVED")
  public ResponseEntity<AdminAffiliationResponse> revoke(
      @PathVariable Long id,
      @Parameter(hidden = true) @CurrentUser Long adminAccountId,
      @Valid @RequestBody AffiliationRejectRequest body) {
    return ResponseEntity.ok(adminAffiliationService.revoke(id, adminAccountId, body.getReason()));
  }

  @PostMapping("/{id}/restore")
  @Operation(summary = "Hoàn thu hồi: đưa affiliation REVOKED về lại APPROVED")
  public ResponseEntity<AdminAffiliationResponse> restore(
      @PathVariable Long id, @Parameter(hidden = true) @CurrentUser Long adminAccountId) {
    return ResponseEntity.ok(adminAffiliationService.restoreRevoked(id, adminAccountId));
  }

  private Sort parseSort(String sortParam) {
    try {
      String[] parts = sortParam.split(",");
      Sort.Direction dir =
          parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
              ? Sort.Direction.ASC
              : Sort.Direction.DESC;
      return Sort.by(dir, parts[0]);
    } catch (Exception e) {
      return Sort.by(Sort.Direction.DESC, "id");
    }
  }
}

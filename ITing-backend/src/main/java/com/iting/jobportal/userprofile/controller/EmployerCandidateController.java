package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.payment.service.QuotaService;
import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.response.CandidateFullProfileResponse;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import com.iting.jobportal.userprofile.service.EmployerCandidateSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * @deprecated Phase 4 dual-mount. Dùng {@link HrCandidateController} ở {@code
 *     /api/hr/candidates/**}. Sẽ remove sau 2 sprint.
 */
@Deprecated(since = "Phase 4")
@RestController
@RequestMapping("/api/employers/candidates")
@RequiredArgsConstructor
@Tag(
    name = "08. Candidates - Employer (DEPRECATED)",
    description = "DEPRECATED — dùng /api/hr/candidates/**")
public class EmployerCandidateController {

  private final EmployerCandidateSearchService employerCandidateSearchService;
  private final AuthorizationService authorizationService;
  private final QuotaService quotaService;

  @PostMapping("/search")
  @PreAuthorize("hasRole('EMPLOYER')")
  @Operation(summary = "Tìm kiếm ứng viên (AI embedding similarity + filters)")
  public ResponseEntity<Page<EmployerCandidateSearchResponse>> search(
      @CurrentUser Long accountId, @RequestBody EmployerCandidateSearchRequest request) {
    // Gate 1: HR APPROVED affiliation (403). Gate 2: tier PRO+ (402).
    authorizationService.requireApprovedCompanyOf(accountId);
    quotaService.requireTalentPoolAccess(accountId);
    return ResponseEntity.ok(employerCandidateSearchService.search(request));
  }

  @GetMapping("/{candidateId}/profile")
  @PreAuthorize("hasRole('EMPLOYER')")
  @Operation(summary = "Lấy toàn bộ hồ sơ chi tiết của ứng viên")
  public ResponseEntity<CandidateFullProfileResponse> getCandidateFullProfile(
      @CurrentUser Long accountId, @PathVariable Long candidateId) {
    authorizationService.requireApprovedCompanyOf(accountId);
    quotaService.requireTalentPoolAccess(accountId);
    return ResponseEntity.ok(employerCandidateSearchService.getCandidateFullProfile(candidateId));
  }
}

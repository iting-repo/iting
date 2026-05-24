package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.payment.service.CreditService;
import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.request.MatchByJobRequest;
import com.iting.jobportal.userprofile.dto.response.CandidateFullProfileResponse;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import com.iting.jobportal.userprofile.service.EmployerCandidateSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * HR-side candidate search. Cùng logic với {@link EmployerCandidateController},
 * chỉ khác base path. Phase 4 dual-mount.
 */
@RestController
@RequestMapping("/api/hr/candidates")
@RequiredArgsConstructor
@Tag(name = "08. Candidates - HR", description = "APIs HR tìm kiếm ứng viên (path mới)")
public class HrCandidateController {

    /** Số credit trừ mỗi lần chạy AI match-by-job. */
    private static final int MATCH_BY_JOB_CREDIT_COST = 5;

    private final EmployerCandidateSearchService employerCandidateSearchService;
    private final JobRepository jobRepository;
    private final CreditService creditService;

    @PostMapping("/search")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Tìm kiếm ứng viên (AI embedding similarity + filters)")
    public ResponseEntity<Page<EmployerCandidateSearchResponse>> search(@RequestBody EmployerCandidateSearchRequest request) {
        return ResponseEntity.ok(employerCandidateSearchService.search(request));
    }

    @GetMapping("/{candidateId}/profile")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Lấy toàn bộ hồ sơ chi tiết của ứng viên")
    public ResponseEntity<CandidateFullProfileResponse> getCandidateFullProfile(@PathVariable Long candidateId) {
        return ResponseEntity.ok(employerCandidateSearchService.getCandidateFullProfile(candidateId));
    }

    /**
     * AI match: dùng embedding của job đã đăng để tìm ứng viên openToWork=true.
     * Mỗi lần chạy trừ {@value #MATCH_BY_JOB_CREDIT_COST} credits.
     */
    @PostMapping("/match-by-job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    @Operation(summary = "Match ứng viên dựa trên job embedding (trừ 5 credits/lần)")
    public ResponseEntity<Page<EmployerCandidateSearchResponse>> matchByJob(
            @PathVariable Long jobId,
            @CurrentUser Long accountId,
            @RequestBody(required = false) MatchByJobRequest request) {

        // Ownership check: HR chỉ được match candidates với job mình đăng.
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
        if (job.getPostedByHrId() == null || !job.getPostedByHrId().equals(accountId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền match ứng viên cho job này");
        }

        // Consume credits trước khi gọi service. Throw InsufficientCreditException → 402.
        creditService.consume(accountId, MATCH_BY_JOB_CREDIT_COST, "AI_CANDIDATE_MATCH",
                jobId, "AI match ứng viên cho job #" + jobId);

        return ResponseEntity.ok(employerCandidateSearchService.searchByJob(jobId, request));
    }
}

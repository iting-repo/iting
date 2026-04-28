package com.iting.jobportal.userprofile.controller;

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

@RestController
@RequestMapping("/api/employers/candidates")
@RequiredArgsConstructor
@Tag(name = "08. Candidates - Employer", description = "APIs tìm kiếm ứng viên cho nhà tuyển dụng (AI similarity search)")
public class EmployerCandidateController {

    private final EmployerCandidateSearchService employerCandidateSearchService;

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
}


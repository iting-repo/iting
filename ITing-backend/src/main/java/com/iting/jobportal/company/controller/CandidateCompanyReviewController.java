package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.response.CompanyReviewResponse;
import com.iting.jobportal.company.service.CompanyReviewService;
import com.iting.jobportal.job.controller.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/candidate/companies")
@RequiredArgsConstructor
public class CandidateCompanyReviewController {

    private final CompanyReviewService reviewService;

    @PostMapping("/{id}/reviews")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CompanyReviewResponse> postReview(
            @PathVariable Long id,
            @CurrentUser Long accountId,
            @RequestBody Map<String, Object> payload) {
        int rating = (int) payload.get("rating");
        String content = (String) payload.get("content");

        return ResponseEntity.ok(
                CompanyReviewResponse.fromEntity(
                        reviewService.createReview(id, accountId, rating, content)));
    }
}

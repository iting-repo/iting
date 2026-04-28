package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.response.CompanyReviewResponse;
import com.iting.jobportal.company.service.CompanyReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/companies")
@RequiredArgsConstructor
public class CompanyReviewController {

    private final CompanyReviewService reviewService;

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<CompanyReviewResponse>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(
            reviewService.getCompanyReviews(id).stream()
                .map(CompanyReviewResponse::fromEntity)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}/rating-stats")
    public ResponseEntity<Map<String, Object>> getRatingStats(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getCompanyRatingStats(id));
    }
}

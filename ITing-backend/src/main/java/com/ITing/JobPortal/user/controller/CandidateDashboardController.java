package com.iting.jobportal.user.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.user.dto.CandidateDashboardStats;
import com.iting.jobportal.user.service.CandidateDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "07.1 Candidate Dashboard", description = "Candidate dashboard APIs")
@RestController
@RequestMapping("/api/candidates/dashboard")
@RequiredArgsConstructor
public class CandidateDashboardController {

    private final CandidateDashboardService candidateDashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get candidate dashboard statistics")
    public ResponseEntity<CandidateDashboardStats> getDashboardStats(@CurrentUser Long userId) {
        return ResponseEntity.ok(candidateDashboardService.getDashboardStats(userId));
    }
}

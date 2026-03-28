package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.request.ApplyJobRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.dto.response.ApplicationSubmitResponse;
import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.application.service.CandidateApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Tag(name = "08.1 Application Candidate", description = "APIs for candidate to apply jobs")
@RestController
@RequestMapping("/api/candidates/applications")
@RequiredArgsConstructor
public class CandidateApplicationController {

    private final CandidateApplicationService candidateApplicationService;

    @PostMapping("/apply")
    @Operation(summary = "Nộp đơn ứng tuyển")
    public ResponseEntity<ApplicationSubmitResponse> applyJob(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody ApplyJobRequest request) {
        return ResponseEntity.ok(candidateApplicationService.applyJob(userId, request));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Rút đơn ứng tuyển")
    public ResponseEntity<?> withdrawApplication(
            @CurrentUser Long userId,
            @PathVariable Long id) {
        candidateApplicationService.withdrawApplication(userId, id);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    @GetMapping("/my-applications")
    @Operation(summary = "Xem danh sách đơn đã nộp (Ứng viên)")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @CurrentUser Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(candidateApplicationService.getMyApplications(userId, page, size));
    }

    @GetMapping("/check/{jobId}")
    @Operation(summary = "Kiểm tra đã ứng tuyển job chưa")
    public ResponseEntity<Map<String, Boolean>> checkApplied(
            @CurrentUser Long userId,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(Map.of("hasApplied", candidateApplicationService.hasApplied(userId, jobId)));
    }
}

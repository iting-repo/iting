package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.*;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.application.service.ApplicationService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Hidden;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "APIs quản lý đơn ứng tuyển")
public class ApplicationController {

    private final ApplicationService applicationService;

    // ========== CHO ỨNG VIÊN ==========

    @PostMapping("/apply")
    @Operation(summary = "Nộp đơn ứng tuyển")
    public ResponseEntity<ApplicationResponse> applyJob(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody ApplyJobRequest request) {
        return ResponseEntity.ok(applicationService.applyJob(userId, request));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Rút đơn ứng tuyển")
    public ResponseEntity<?> withdrawApplication(
            @CurrentUser Long userId,
            @PathVariable Long id) {
        applicationService.withdrawApplication(userId, id);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    @GetMapping("/my-applications")
    @Operation(summary = "Xem danh sách đơn đã nộp (Ứng viên)")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @CurrentUser Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(applicationService.getMyApplications(userId, page, size));
    }

    @GetMapping("/check/{jobId}")
    @Operation(summary = "Kiểm tra đã ứng tuyển job chưa")
    public ResponseEntity<Map<String, Boolean>> checkApplied(
            @CurrentUser Long userId,
            @PathVariable Long jobId) {
        boolean hasApplied = applicationService.hasApplied(userId, jobId);
        return ResponseEntity.ok(Map.of("hasApplied", hasApplied));
    }

    // ========== CHO NHÀ TUYỂN DỤNG ==========

    @GetMapping("/job/{jobId}")
    @Operation(summary = "Xem danh sách đơn ứng tuyển của một job (Employer)")
    public ResponseEntity<Page<ApplicationResponse>> getApplicationsByJob(
            @CurrentUser Long employerId,
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(employerId, jobId, page, size));
    }

    @GetMapping("/employer")
    @Operation(summary = "Xem tất cả đơn ứng tuyển (Employer)")
    public ResponseEntity<Page<ApplicationResponse>> getAllApplications(
            @CurrentUser Long employerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(applicationService.getAllApplicationsForEmployer(employerId, page, size));
    }

    @GetMapping("/employer/search")
    @Operation(summary = "Tìm kiếm và lọc đơn ứng tuyển (Employer)")
    public ResponseEntity<Page<ApplicationResponse>> searchApplications(
            @CurrentUser Long employerId,
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "appliedAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        ApplicationSearchRequest request = new ApplicationSearchRequest();
        request.setJobId(jobId);
        if (status != null) {
            request.setStatus(ApplicationStatus.valueOf(status));
        }
        request.setKeyword(keyword);
        request.setSortBy(sortBy);
        request.setSortOrder(sortOrder);
        request.setPage(page);
        request.setSize(size);
        
        return ResponseEntity.ok(applicationService.searchApplications(employerId, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn ứng tuyển (đánh dấu đã xem)")
    public ResponseEntity<ApplicationResponse> viewApplication(
            @CurrentUser Long employerId,
            @PathVariable Long id) {
        return ResponseEntity.ok(applicationService.viewApplication(employerId, id));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn ứng tuyển")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @CurrentUser Long employerId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(employerId, id, request));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Chấp nhận ứng viên")
    public ResponseEntity<ApplicationResponse> acceptApplication(
            @CurrentUser Long employerId,
            @PathVariable Long id,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(applicationService.acceptApplication(employerId, id, note));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Từ chối ứng viên")
    public ResponseEntity<ApplicationResponse> rejectApplication(
            @CurrentUser Long employerId,
            @PathVariable Long id,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(applicationService.rejectApplication(employerId, id, note));
    }

    @PostMapping("/{id}/shortlist")
    @Operation(summary = "Đưa vào danh sách ngắn")
    public ResponseEntity<ApplicationResponse> shortlistApplication(
            @CurrentUser Long employerId,
            @PathVariable Long id) {
        UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
        request.setStatus(ApplicationStatus.SHORTLISTED);
        return ResponseEntity.ok(applicationService.updateApplicationStatus(employerId, id, request));
    }

    // ========== THỐNG KÊ ==========

    @GetMapping("/stats/employer")
    @Operation(summary = "Thống kê đơn ứng tuyển (Employer)")
    public ResponseEntity<ApplicationStats> getEmployerStats(
            @CurrentUser Long employerId) {
        return ResponseEntity.ok(applicationService.getStatsForEmployer(employerId));
    }

    @GetMapping("/stats/job/{jobId}")
    @Operation(summary = "Thống kê đơn ứng tuyển của một job")
    public ResponseEntity<ApplicationStats> getJobStats(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getStatsForJob(jobId));
    }
}


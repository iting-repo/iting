package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.response.ReportStatsResponse;
import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.admin.service.AdminReportService;
import com.iting.jobportal.common.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final AdminReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserReport>>> getReports(
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(required = false, defaultValue = "all") String targetType,
            @RequestParam(required = false, defaultValue = "all") String priority,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<UserReport> reports = reportService.getReports(status, type, targetType, priority, search, page, size);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserReport>> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportById(id)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ReportStatsResponse>> getReportStats() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportStats()));
    }

    @PutMapping("/{id}/handle")
    public ResponseEntity<ApiResponse<UserReport>> handleReport(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam String note,
            @RequestAttribute("userId") Long adminId) {
        
        UserReport report = reportService.handleReport(adminId, id, status, note);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}

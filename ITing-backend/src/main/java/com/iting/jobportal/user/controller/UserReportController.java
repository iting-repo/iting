package com.iting.jobportal.user.controller;

import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.admin.service.AdminReportService;
import com.iting.jobportal.auth.security.AuthUser;
import com.iting.jobportal.common.dto.response.ApiResponse;
import com.iting.jobportal.user.dto.request.ReportRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class UserReportController {

    private final AdminReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserReport>> createReport(
            @RequestBody ReportRequest request,
            @AuthenticationPrincipal AuthUser authUser) {

        UserReport report = reportService.createReport(authUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}

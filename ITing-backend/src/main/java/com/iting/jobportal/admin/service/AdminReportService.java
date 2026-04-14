package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.response.ReportStatsResponse;
import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.user.dto.request.ReportRequest;
import org.springframework.data.domain.Page;

public interface AdminReportService {

    Page<UserReport> getReports(String status, String type, String targetType, String priority, String search, int page, int size);

    UserReport createReport(Long reporterId, ReportRequest request);

    UserReport handleReport(Long adminId, Long reportId, String status, String note);

    ReportStatsResponse getReportStats();

    UserReport getReportById(Long id);

}
package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.entity.UserReport;
import org.springframework.data.domain.Page;

public interface AdminReportService {

    Page<UserReport> getReports(String status, int page, int size);

    UserReport handleReport(Long adminId, Long reportId, String status, String note);

}
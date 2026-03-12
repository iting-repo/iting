package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.admin.repository.UserReportRepository;
import com.iting.jobportal.admin.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminReportServiceImpl implements AdminReportService {

    private final UserReportRepository reportRepository;

    @Override
    public Page<UserReport> getReports(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reportRepository.findAll(pageable);
    }

    @Override
    public UserReport handleReport(Long adminId, Long reportId, String status, String note) {
        UserReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status);
        return reportRepository.save(report);
    }
}
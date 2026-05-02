package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.response.ReportStatsResponse;
import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.admin.repository.UserReportRepository;
import com.iting.jobportal.admin.service.AdminReportService;
import com.iting.jobportal.admin.service.AdminNotificationService;
import com.iting.jobportal.user.dto.request.ReportRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminReportServiceImpl implements AdminReportService {

    private final UserReportRepository reportRepository;
    private final AdminNotificationService adminNotificationService;

    @Override
    public Page<UserReport> getReports(String status, String type, String targetType, String priority, String search,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        // For now, simple return all. In real app, use Specification or QueryDSL
        return reportRepository.findAll(pageable);
    }

    @Override
    public UserReport createReport(Long reporterId, ReportRequest request) {
        UserReport report = UserReport.builder()
                .reporterId(reporterId)
                .targetId(request.getTargetId())
                .targetType(request.getTargetType())
                .targetName(request.getTargetName())
                .type(request.getType())
                .reason(request.getReason())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status("PENDING")
                .build();
        UserReport saved = reportRepository.save(report);
        
        try {
            adminNotificationService.notifyUserReport(saved);
        } catch (Exception e) {
            log.error("Failed to notify admin about new user report", e);
        }
        
        return saved;
    }

    @Override
    public UserReport handleReport(Long adminId, Long reportId, String status, String note) {
        UserReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status);
        report.setAdminNote(note);
        report.setHandledBy(adminId);
        report.setHandledAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    @Override
    public ReportStatsResponse getReportStats() {
        long total = reportRepository.count();
        long pending = reportRepository.countByStatus("PENDING");
        long critical = reportRepository.countByPriority("CRITICAL");

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("PENDING", pending);
        byStatus.put("REVIEWING", reportRepository.countByStatus("REVIEWING"));
        byStatus.put("RESOLVED", reportRepository.countByStatus("RESOLVED"));
        byStatus.put("DISMISSED", reportRepository.countByStatus("DISMISSED"));

        return ReportStatsResponse.builder()
                .totalReports(total)
                .pendingReports(pending)
                .criticalReports(critical)
                .reportsByStatus(byStatus)
                .build();
    }

    @Override
    public UserReport getReportById(Long id) {
        return reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
    }
}
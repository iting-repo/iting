package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.response.ReportStatsResponse;
import com.iting.jobportal.admin.entity.UserReport;
import com.iting.jobportal.admin.service.AdminReportService;
import com.iting.jobportal.common.dto.response.ApiResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AdminReportControllerTest {

  @Mock private AdminReportService reportService;
  @InjectMocks private AdminReportController controller;

  @Test
  void getReports_passesAllFilters() {
    Page<UserReport> page = new PageImpl<>(List.of());
    when(reportService.getReports("PENDING", "SPAM", "JOB", "HIGH", "scam", 0, 10))
        .thenReturn(page);

    ResponseEntity<ApiResponse<Page<UserReport>>> resp =
        controller.getReports("PENDING", "SPAM", "JOB", "HIGH", "scam", 0, 10);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertNotNull(resp.getBody());
    assertSame(page, resp.getBody().getData());
  }

  @Test
  void getReportById_delegatesToService() {
    UserReport report = new UserReport();
    when(reportService.getReportById(5L)).thenReturn(report);

    ResponseEntity<ApiResponse<UserReport>> resp = controller.getReportById(5L);

    assertSame(report, resp.getBody().getData());
  }

  @Test
  void getReportStats_delegatesToService() {
    ReportStatsResponse stats = new ReportStatsResponse();
    when(reportService.getReportStats()).thenReturn(stats);

    ResponseEntity<ApiResponse<ReportStatsResponse>> resp = controller.getReportStats();

    assertSame(stats, resp.getBody().getData());
  }

  @Test
  void handleReport_passesAdminIdAndArgs() {
    UserReport updated = new UserReport();
    when(reportService.handleReport(99L, 1L, "RESOLVED", "Done")).thenReturn(updated);

    ResponseEntity<ApiResponse<UserReport>> resp =
        controller.handleReport(1L, "RESOLVED", "Done", 99L);

    assertSame(updated, resp.getBody().getData());
  }
}

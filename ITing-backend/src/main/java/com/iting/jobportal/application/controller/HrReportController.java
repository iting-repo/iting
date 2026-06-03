package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.response.HrReportResponse;
import com.iting.jobportal.application.service.HrReportService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr/reports")
@RequiredArgsConstructor
@Tag(name = "HR Reports", description = "Báo cáo tổng quan tuyển dụng cho HR")
public class HrReportController {

  private final HrReportService hrReportService;

  @GetMapping("/overview")
  @PreAuthorize("hasRole('EMPLOYER')")
  @Operation(summary = "Báo cáo dashboard tổng quan trong khoảng [from, to]")
  public ResponseEntity<HrReportResponse> getOverview(
      @CurrentUser Long accountId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

    LocalDate today = LocalDate.now();
    LocalDate effectiveTo = to != null ? to : today;
    // Default 365 ngày — đa số HR tự seed dữ liệu thưa, 30 ngày quá hẹp.
    // User vẫn có thể chọn range hẹp hơn qua date picker.
    LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(365);
    if (effectiveFrom.isAfter(effectiveTo)) {
      LocalDate swap = effectiveFrom;
      effectiveFrom = effectiveTo;
      effectiveTo = swap;
    }
    return ResponseEntity.ok(hrReportService.buildOverview(accountId, effectiveFrom, effectiveTo));
  }
}

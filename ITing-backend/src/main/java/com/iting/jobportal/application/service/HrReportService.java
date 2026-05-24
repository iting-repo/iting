package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.response.HrReportResponse;

import java.time.LocalDate;

public interface HrReportService {
    /**
     * Build báo cáo tổng quan cho HR account trong khoảng thời gian [from, to] (inclusive).
     */
    HrReportResponse buildOverview(Long hrAccountId, LocalDate from, LocalDate to);
}

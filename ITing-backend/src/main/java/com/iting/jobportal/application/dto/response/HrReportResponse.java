package com.iting.jobportal.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Báo cáo tổng quan tuyển dụng cho HR — gom tất cả số liệu trong 1 response
 * để frontend render dashboard trong 1 lần fetch.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrReportResponse {

    /** Tổng số application nhận được trong khoảng thời gian. */
    private long totalApplications;
    /** Số job đã đăng (mọi status). */
    private long totalJobs;
    /** Số job đang ACTIVE. */
    private long activeJobs;
    /** Số lần đã chạy AI candidate match (credit_transaction source=AI_CANDIDATE_MATCH). */
    private long aiMatchCount;
    /** Job hiện đang được boost (featured_until > now). */
    private long boostedJobs;

    /** Đếm application theo pipeline stage. Key = stage code. */
    private Map<String, Long> applicationsByStage;

    // ── Cost & credits ──
    /** VND đã thanh toán (sum amount của PaymentOrder PAID). */
    private long totalSpentVnd;
    /** Credits đã được grant (subscription). */
    private long creditsGranted;
    /** Credits đã consume (AI match + boost...). */
    private long creditsSpent;
    /** Số dư credit hiện tại. */
    private long creditsBalance;

    /** Chi phí trung bình per stage (VND / count). Key = stage code. */
    private Map<String, Double> costPerStageVnd;

    /** Time series application count theo ngày (latest 30 days hoặc theo range). */
    private List<TimeSeriesPoint> timeSeries;

    /** Top 5 job có nhiều application nhất. */
    private List<JobBreakdown> topJobs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private LocalDate date;
        private long applications;
        private long interviews;
        private long offers;
        private long hired;
        private long rejected;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobBreakdown {
        private Long jobId;
        private String title;
        private long totalApplications;
        private long screening;
        private long phoneScreen;
        private long interview;
        private long offer;
        private long hired;
        private long rejected;
    }
}

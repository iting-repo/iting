package com.iting.jobportal.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Thống kê đơn ứng tuyển cho 1 job — admin dashboard.
 * - employerResponded: số đơn nhà tuyển dụng đã xử lý (status != PENDING).
 * - successRate / rejectionRate: % trong tổng số đơn đã xử lý (loại PENDING + WITHDRAWN).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationStatsResponse {
    private long total;
    private long pending;
    private long viewed;
    private long accepted;
    private long rejected;
    private long withdrawn;

    private long employerResponded; // # đơn không còn PENDING
    private double successRate;      // accepted / (accepted + rejected) * 100
    private double rejectionRate;    // rejected / (accepted + rejected) * 100
    private double responseRate;     // employerResponded / total * 100
}

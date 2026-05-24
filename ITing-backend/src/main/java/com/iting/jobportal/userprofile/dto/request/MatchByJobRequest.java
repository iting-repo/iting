package com.iting.jobportal.userprofile.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Request body cho POST /api/hr/candidates/match-by-job/{jobId}.
 * Tất cả fields đều optional — service sẽ điền default + pull thêm từ Job entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchByJobRequest {
    /** 0-based page. */
    private Integer page;
    /** Page size, max 50. */
    private Integer size;
    /** Override location filter (mặc định lấy từ job.province). */
    private String locationOverride;
}

package com.iting.jobportal.job.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryReportResponse {
    private Double averageSalary;
    private Double minSalary;
    private Double maxSalary;
    private List<ChartData> experienceStats;
    private List<ChartData> locationStats;
    private List<JobResponse> highSalaryJobs;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartData {
        private String label;
        private Double value;
    }
}

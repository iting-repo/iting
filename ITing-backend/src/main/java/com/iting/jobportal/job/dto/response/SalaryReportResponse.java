package com.iting.jobportal.job.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
  private List<String> relatedPositions;

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ChartData {
    private String label;
    private Double value;
  }
}

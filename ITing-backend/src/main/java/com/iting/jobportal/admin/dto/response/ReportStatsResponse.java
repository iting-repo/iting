package com.iting.jobportal.admin.dto.response;

import java.util.Map;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportStatsResponse {
  private long totalReports;
  private long pendingReports;
  private long criticalReports;
  private long resolvedThisWeek;

  private Map<String, Long> reportsByCategory;
  private Map<String, Long> reportsByTargetType;
  private Map<String, Long> reportsByStatus;
}

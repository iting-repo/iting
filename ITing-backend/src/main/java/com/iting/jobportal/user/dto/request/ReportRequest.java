package com.iting.jobportal.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
  private Long targetId;
  private String targetType; // JOB, COMPANY, USER, REVIEW
  private String targetName;
  private String type; // Category: SPAM, SCAM, INAPPROPRIATE, etc.
  private String reason;
  private String description;
  private String priority;
}

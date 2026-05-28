package com.iting.jobportal.recommendation.dto.response;

import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchHistoryResponse {

  private Long id;
  private String keyword;
  private String location;
  private BigDecimal salaryMin;
  private BigDecimal salaryMax;
  private JobType jobType;
  private LocalDateTime createdAt;

  public static SearchHistoryResponse from(UserSearchHistory entity) {
    return SearchHistoryResponse.builder()
        .id(entity.getId())
        .keyword(entity.getKeyword())
        .location(entity.getLocation())
        .salaryMin(entity.getSalaryMin())
        .salaryMax(entity.getSalaryMax())
        .jobType(entity.getJobType())
        .createdAt(entity.getCreatedAt())
        .build();
  }
}

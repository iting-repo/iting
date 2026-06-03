package com.iting.jobportal.job.dto.response;

import com.iting.jobportal.job.entity.JobReviewHistory;
import com.iting.jobportal.job.entity.enums.JobReviewAction;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobReviewHistoryResponse {
  private JobReviewAction action;
  private String actor;
  private LocalDateTime timestamp;
  private String note;

  public static JobReviewHistoryResponse fromEntity(JobReviewHistory history) {
    return JobReviewHistoryResponse.builder()
        .action(history.getAction())
        .actor(history.getActor())
        .timestamp(history.getTimestamp())
        .note(history.getNote())
        .build();
  }
}

package com.iting.jobportal.application.entity;

import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Apply_form_user_to_job")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyFormSentToJob {

  @EmbeddedId private ApplyFormSentToJobId id;

  @Column(name = "Time_sent")
  private LocalDateTime timeSent;

  @Enumerated(EnumType.STRING)
  @Column(name = "Status")
  private ApplicationStatus status;

  @Column(name = "hr_note", columnDefinition = "TEXT")
  private String employerNote;

  // Denormalized userId (V53 added user_id column with FK to users, NOT NULL after backfill)
  @Column(name = "user_id")
  private Long userId;

  // HR pipeline (V79). Default 'SCREENING' on insert if not set.
  @Column(name = "pipeline_stage", length = 30)
  private String pipelineStage;

  @Column(name = "stage_updated_at")
  private LocalDateTime stageUpdatedAt;

  @Column(name = "stage_updated_by")
  private Long stageUpdatedBy;

  /** Điểm phù hợp CV ↔ Job (0–100%). Tính tự động bằng AI cosine similarity khi ứng tuyển. */
  @Column(name = "match_score")
  private Double matchScore;

  @PrePersist
  protected void onCreate() {
    if (timeSent == null) {
      timeSent = LocalDateTime.now();
    }
    if (status == null) {
      status = ApplicationStatus.PENDING;
    }
    if (pipelineStage == null || pipelineStage.isBlank()) {
      pipelineStage = "SCREENING";
    }
  }

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Embeddable
  public static class ApplyFormSentToJobId implements Serializable {

    @Column(name = "Job_id", nullable = false)
    private Long jobId;

    @Column(name = "Apply_form_id", nullable = false)
    private Long applyFormId;
  }
}

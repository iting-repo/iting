package com.iting.jobportal.application.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Audit trail — every stage transition is logged for analytics + dispute resolution. */
@Entity
@Table(name = "application_stage_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStageHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "applyform_id", nullable = false)
    private Long applyFormId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "from_stage", length = 30)
    private String fromStage;

    @Column(name = "to_stage", nullable = false, length = 30)
    private String toStage;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "moved_by")
    private Long movedBy;

    @Column(name = "moved_at", nullable = false)
    private LocalDateTime movedAt;

    @PrePersist
    void onCreate() { if (movedAt == null) movedAt = LocalDateTime.now(); }
}

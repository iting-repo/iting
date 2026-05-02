package com.iting.jobportal.job.entity;

import com.iting.jobportal.job.entity.enums.JobReviewAction;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_review_history")
@Getter
@Setter
public class JobReviewHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id")
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private JobReviewAction action;

    @Column(name = "actor", nullable = false, length = 255)
    private String actor;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
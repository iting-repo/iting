package com.iting.jobportal.recommendation.entity;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.common.entity.AuditEntity;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_job_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserJobInteraction extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(name = "interaction_type", nullable = false)
    private InteractionType interactionType;

    @Column(name = "weight", nullable = false)
    private Integer weight;
}

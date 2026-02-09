package com.iting.jobportal.job.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Job extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employerId;

    @Column(nullable = false, length = 255)
    private String position;

    @Column(length = 5000)
    private String description;

    @Column(length = 500)
    private String requirements;

    @Column(length = 500)
    private String techRequired;

    @Column(length = 500)
    private String benefits;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobType jobType; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ExperienceLevel experienceLevel; // FRESHER, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobStatus status; // DRAFT, PENDING, ACTIVE, EXPIRED, CLOSED

    private Integer maxAccept;

    private Integer currentAccepted;

    private Long minSalary;

    private Long maxSalary;

    private LocalDate dueDate;

    private Integer viewCount;

    private Integer applicationCount;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = JobStatus.ACTIVE;
        }
        if (viewCount == null) {
            viewCount = 0;
        }
        if (applicationCount == null) {
            applicationCount = 0;
        }
        if (currentAccepted == null) {
            currentAccepted = 0;
        }
    }
}

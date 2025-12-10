package com.iting.jobportal.job.entity;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employerId;

    @Column(nullable = false, length = 255)
    private String position;

    @Column(length = 5000)
    private String description;

    @Column(length = 1000)
    private String requirements;

    @Column(length = 255)
    private String location;

    @Column(length = 1000)
    private String techRequired;

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

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer viewCount;

    private Integer applicationCount;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
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

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

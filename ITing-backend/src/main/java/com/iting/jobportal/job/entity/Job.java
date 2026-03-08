package com.iting.jobportal.job.entity;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "Job")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Transient
    private Long employerId;

    @Column(name = "Position", nullable = false, length = 100)
    private String position;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Transient
    private String requirements;

    @Column(name = "Tech_required", columnDefinition = "TEXT")
    private String techRequired;

    @Transient
    private String benefits;

    @Column(name = "Location", length = 255)
    private String location;

    @Transient
    private JobType jobType; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE

    @Transient
    private ExperienceLevel experienceLevel; // FRESHER, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 50)
    private JobStatus status; // DRAFT, PENDING, ACTIVE, EXPIRED, CLOSED

    @Column(name = "Min_accept", length = 100)
    private String minAccept;

    @Transient
    private Integer maxAccept;

    private Integer currentAccepted;

    @Column(name = "Min_salary", precision = 15, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "Max_salary", precision = 15, scale = 2)
    private BigDecimal maxSalary;

    @Column(name = "Due_date")
    private LocalDate dueDate;

    @Column(name = "Job_embedding", columnDefinition = "TEXT")
    private String jobEmbedding;

    @Column(name = "Loc_id")
    private Long locId;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;

    @Transient
    private Integer viewCount;

    @Transient
    private Integer applicationCount;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = JobStatus.ACTIVE;
        }
        if (lastUpdate == null) {
            lastUpdate = LocalDateTime.now();
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

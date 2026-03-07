package com.iting.jobportal.job.entity;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    // Thêm Company_id để khớp database
    @Column(name = "Company_id", nullable = false)
    private Long companyId;

    @Column(name = "Position", length = 255)
    private String position;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "Tech_required", columnDefinition = "TEXT")
    private String techRequired;

    @Enumerated(EnumType.STRING)
    @Column(name = "Job_type", length = 50)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "Experience_level", length = 50)
    private ExperienceLevel experienceLevel;

    @Column(name = "Min_salary", precision = 15, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "Max_salary", precision = 15, scale = 2)
    private BigDecimal maxSalary;

    @Column(name = "Min_accept", columnDefinition = "TEXT")
    private String minAccept;

    @Column(name = "Max_accept")
    private Integer maxAccept;

    @Column(name = "Current_accepted")
    private Integer currentAccepted;


    @Column(name = "View_count")
    private Integer viewCount;

    @Column(name = "Application_count")
    private Integer applicationCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", length = 50)
    private JobStatus status;

    @Column(name = "Due_date")
    private LocalDate dueDate;

    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;

    @Column(name = "Location", length = 255)
    private String location;

    @Column(name = "Loc_id")
    private Long locId;

    @Column(name = "Job_embedding", columnDefinition = "TEXT")
    private String jobEmbedding;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = JobStatus.ACTIVE;
        }
        if (lastUpdate == null) {
            lastUpdate = LocalDateTime.now();
        }

        if (viewCount == null) viewCount = 0;
        if (applicationCount == null) applicationCount = 0;
        if (currentAccepted == null) currentAccepted = 0;
        if (maxAccept == null) maxAccept = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdate = LocalDateTime.now();
    }
}
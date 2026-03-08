package com.iting.jobportal.job.dto;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class JobResponse {
    private Long id;
    private Long employerId;
    private String companyName;
    private String companyLogo;
    private String position;
    private String description;
    private String requirements;
    private String location;
    private String techRequired;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private JobStatus status;
    private Integer maxAccept;
    private Integer currentAccepted;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private LocalDate dueDate;
    private LocalDateTime lastUpdate;
    private Integer viewCount;
    private Integer applicationCount;
    
    public static JobResponse fromEntity(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .employerId(job.getEmployerId())
                .position(job.getPosition())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .location(job.getLocation())
                .techRequired(job.getTechRequired())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .status(job.getStatus())
                .maxAccept(job.getMaxAccept())
                .currentAccepted(job.getCurrentAccepted())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .dueDate(job.getDueDate())
                .lastUpdate(job.getLastUpdate())
                .viewCount(job.getViewCount())
                .applicationCount(job.getApplicationCount())
                .build();
    }
}


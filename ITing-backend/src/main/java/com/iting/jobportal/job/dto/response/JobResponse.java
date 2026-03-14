package com.iting.jobportal.job.dto.response;

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
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private String position;
    private String description;
    private String location;
    private Long locId;
    private String techRequired;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private JobStatus status;
    private String minAccept;
    private Integer maxAccept;
    private Integer currentAccepted;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private LocalDate dueDate;
    private LocalDateTime lastUpdate;
    private Integer viewCount;
    private Integer applicationCount;

    public static JobResponse fromEntity(Job job) {
        return fromEntityWithCompany(job, null, null);
    }

    public static JobResponse fromEntityWithCompany(Job job, String companyName, String companyLogo) {
        return JobResponse.builder()
                .id(job.getId())
                .companyId(job.getCompany().getId())
                .companyName(companyName)
                .companyLogo(companyLogo)
                .position(job.getPosition())
                .description(job.getDescription())
                .location(job.getLocation())
                .locId(job.getLocId())
                .techRequired(job.getTechRequired())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .status(job.getStatus())
                .minAccept(job.getMinAccept())
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


package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateJobRequest {
    private String position;
    private String description;
    private String location;
    private String techRequired;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private JobStatus status;
    private Integer maxAccept;
    private String minAccept;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private LocalDate dueDate;
    private Long locId;
}

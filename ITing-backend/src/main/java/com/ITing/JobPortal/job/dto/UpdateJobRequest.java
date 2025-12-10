package com.iting.jobportal.job.dto;

import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateJobRequest {
    private String position;
    private String description;
    private String requirements;
    private String location;
    private String techRequired;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private JobStatus status;
    private Integer maxAccept;
    private Long minSalary;
    private Long maxSalary;
    private LocalDate dueDate;
}


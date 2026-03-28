package com.iting.jobportal.job.dto.request;

import com.iting.jobportal.job.entity.enums.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateJobRequest {

    private String title;

    private String position;

    private String techRequired;

    private JobType jobType;

    private ExperienceLevel experienceLevel;

    private String workingDays;

    private BigDecimal minSalary;

    private BigDecimal maxSalary;

    private SalaryType salaryType;

    private Integer maxAccept;

    private LocalDate dueDate;

    private String city;

    private String district;

    private String address;

    private String location;

    private Long locId;

    private String description;

    private String responsibilities;

    private String requirements;

    private String benefits;

    private JobStatus status;
}
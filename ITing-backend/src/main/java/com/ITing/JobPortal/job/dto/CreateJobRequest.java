package com.ITing.JobPortal.job.dto;

import java.time.LocalDate;

public class CreateJobRequest {
    private String position;
    private String description;
    private String location;
    private String techRequired;
    private Integer maxAccept;
    private Long minSalary;
    private Long maxSalary;
    private LocalDate dueDate;
}

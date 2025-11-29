package com.iting.jobportal.job.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
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

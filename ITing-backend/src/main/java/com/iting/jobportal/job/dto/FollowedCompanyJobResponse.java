package com.iting.jobportal.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowedCompanyJobResponse {
    private Long jobId;
    private String title;
    private String position;
    private String companyName;
    private String companyLogo;
    private String jobType;
    private String location;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String salaryType;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private boolean isSaved;
}

package com.iting.jobportal.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJobResponse {
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogo;
    private String jobType;
    private String location;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String salaryType;
    private LocalDateTime savedAt;
}

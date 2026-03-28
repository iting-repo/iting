package com.iting.jobportal.job.dto.response;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class JobResponse {

    private Long id;

    // Company
    private Long companyId;
    private String companyName;
    private String companyLogo;

    // Basic
    private String title;
    private String position;
    private String techRequired;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private String workingDays;

    // Salary
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private SalaryType salaryType;

    // Quantity
    private Integer maxAccept;
    private Integer currentAccepted;

    // Deadline
    private LocalDate dueDate;

    // Location
    private String city;
    private String district;
    private String address;
    private String location;
    private Long locId; // ✅ GIỮ

    // Content
    private String description;
    private String responsibilities;
    private String requirements;
    private String benefits;

    // System
    private Integer viewCount;
    private Integer applicationCount;
    private Boolean featured;
    private JobStatus status;

    // Review
    private String reviewReason;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdate;

    public static JobResponse fromEntity(Job job) {
        return fromEntityWithCompany(
                job,
                job.getCompany() != null ? job.getCompany().getName() : null,
                job.getCompany() != null ? job.getCompany().getLogoUrl() : null
        );
    }

    public static JobResponse fromEntityWithCompany(Job job, String companyName, String companyLogo) {
        return JobResponse.builder()
                .id(job.getId())

                .companyId(job.getCompany() != null ? job.getCompany().getId() : null)
                .companyName(companyName)
                .companyLogo(companyLogo)

                .title(job.getTitle())
                .position(job.getPosition())
                .techRequired(job.getTechRequired())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .workingDays(job.getWorkingDays())

                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .salaryType(job.getSalaryType())

                .maxAccept(job.getMaxAccept())
                .currentAccepted(job.getCurrentAccepted())

                .dueDate(job.getDueDate())

                .city(job.getCity())
                .district(job.getDistrict())
                .address(job.getAddress())
                .location(job.getLocation())
                .locId(job.getLocId()) // ✅ GIỮ

                .description(job.getDescription())
                .responsibilities(job.getResponsibilities())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())

                .viewCount(job.getViewCount())
                .applicationCount(job.getApplicationCount())
                .featured(job.getFeatured())
                .status(job.getStatus())

                .reviewReason(job.getReviewReason())
                .reviewedBy(job.getReviewedBy())
                .reviewedAt(job.getReviewedAt())

                .createdAt(job.getCreatedAt())
                .lastUpdate(job.getLastUpdate())
                .build();
    }
}
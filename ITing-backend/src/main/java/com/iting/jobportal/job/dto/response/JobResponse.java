package com.iting.jobportal.job.dto.response;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class JobResponse {

    private Long id;

    // Company
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private String logo;    // Alias for companyLogo
    private String logoUrl; // Alias for companyLogo

    // Basic
    private String title;
    private String position;
    private List<String> skills;

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
    private String province;
    private String ward;
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
    private Boolean isAiSuggested;

    // Review
    private String reviewReason;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;

    private String aiReviewStatus;
    private String aiReviewReason;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdate;

    private List<JobReviewHistoryResponse> reviewHistories;


    public static JobResponse fromEntity(Job job) {
        String companyName = null;
        String companyLogo = null;
        
        try {
            if (job.getCompany() != null) {
                companyName = job.getCompany().getName();
                companyLogo = job.getCompany().getLogoUrl();
            }
        } catch (Exception e) {
            // Handle cases where company proxy exists but the underlying record is missing (e.g., stale data)
            // We use the ID if we can't get the name
        }

        return fromEntityWithCompany(job, companyName, companyLogo);
    }

    public static JobResponse fromEntityWithCompany(Job job, String companyName, String companyLogo) {
        return JobResponse.builder()
                .id(job.getId())

                .companyId(job.getCompany() != null ? job.getCompany().getId() : null)
                .companyName(companyName)
                .companyLogo(companyLogo)
                .logo(companyLogo)
                .logoUrl(companyLogo)

                .title(job.getTitle())
                .position(job.getPosition())
                .skills(job.getSkills())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .workingDays(job.getWorkingDays() != null ? job.getWorkingDays().name() : null)

                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .salaryType(job.getSalaryType())

                .maxAccept(job.getMaxAccept())
                .currentAccepted(job.getCurrentAccepted())

                .dueDate(job.getDueDate())

                .province(job.getProvince())
                .ward(job.getWard())
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

                .reviewReason(
                        job.getStatus() == JobStatus.REJECTED || job.getStatus() == JobStatus.SUSPENDED
                                ? job.getReviewReason()
                                : null
                )
                .reviewedBy(job.getReviewedBy())
                .reviewedAt(job.getReviewedAt())

                .aiReviewStatus(job.getAiReviewStatus())
                .aiReviewReason(job.getAiReviewReason())

                .createdAt(job.getCreatedAt())
                .lastUpdate(job.getLastUpdate())
                .build();
    }
}
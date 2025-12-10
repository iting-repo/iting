package com.iting.jobportal.application.dto;

import com.iting.jobportal.application.entity.JobApplication;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    private Long id;
    private Long userId;
    private Long jobId;
    private Long employerId;
    
    // Thông tin job
    private String jobPosition;
    private String companyName;
    
    // Thông tin ứng viên
    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;
    private String cvUrl;
    private String cvTitle;
    private String coverLetter;
    
    // Trạng thái
    private ApplicationStatus status;
    private String employerNote;
    
    // Thời gian
    private LocalDateTime appliedAt;
    private LocalDateTime viewedAt;
    private LocalDateTime updatedAt;
    
    public static ApplicationResponse fromEntity(JobApplication app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .userId(app.getUserId())
                .jobId(app.getJobId())
                .employerId(app.getEmployerId())
                .applicantName(app.getApplicantName())
                .applicantEmail(app.getApplicantEmail())
                .applicantPhone(app.getApplicantPhone())
                .cvUrl(app.getCvUrl())
                .cvTitle(app.getCvTitle())
                .coverLetter(app.getCoverLetter())
                .status(app.getStatus())
                .employerNote(app.getEmployerNote())
                .appliedAt(app.getAppliedAt())
                .viewedAt(app.getViewedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}


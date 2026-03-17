package com.iting.jobportal.application.dto;

import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long userId;
    private Long jobId;

    // Candidate info
    private String applicantName;
    private String avatarUrl;
    private String jobTitle;        // e.g. "Website Designer (UI/UX)"

    // Introduction / cover letter
    private String introduction;

    // CV info
    private String cvFileName;      // e.g. "NguyenVanA"
    private String cvFileType;      // e.g. "PDF"
    private String cvUrl;           // download link

    // List card fields (for /api/applications/job/{jobId})
    private Integer yearsExperience; // total years across all experience entries
    private String education;        // highest degree, e.g. "Master Degree"

    // Contact info
    private String phoneNumber;
    private String email;

    private LocalDateTime timeSent;

    public static ApplicationResponse fromEntities(ApplyForm applyForm, ApplyFormSentToJob applyFormSentToJob) {
        return ApplicationResponse.builder()
                .id(applyForm.getId())           // applyForm.getId() trả về Long
                .userId(applyForm.getUserId())   // applyForm.getUserId() trả về Long
                .jobId(applyFormSentToJob.getId().getJobId()) // Trả về Long
                .applicantName(applyForm.getApplicantName())
                .introduction(applyForm.getIntroduction())
                .timeSent(applyFormSentToJob.getTimeSent())
                .build();
    }
}
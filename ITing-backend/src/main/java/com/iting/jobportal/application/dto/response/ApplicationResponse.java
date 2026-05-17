package com.iting.jobportal.application.dto.response;

import com.iting.jobportal.userprofile.entity.CV;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long userId;
    private Long jobId;
    private Long companyId;
    private String companyName;
    private String applicantName;
    private String avatarUrl;
    private String jobTitle;
    private String companyLogo;
    private Boolean companyActive;
    private String introduction;

    // CV Info
    private String cvFileName;
    private String cvFileType;
    private String cvUrl;

    // Contact Info
    private String phoneNumber;
    private String email;

    // Professional Profile
    private Integer yearsExperience;
    private String education;

    private LocalDateTime timeSent;
    private ApplicationStatus status;
    private String employerNote;

    public static ApplicationResponse fromEntities(
            ApplyForm form,
            ApplyFormSentToJob sent,
            CV cv) {
        String fileName = null;
        String fileType = null;
        String fileUrl = null;

        if (cv != null) {
            fileUrl = cv.getFileUrl();

            // fileName
            if (cv.getTitle() != null && !cv.getTitle().isBlank()) {
                fileName = cv.getTitle();
            } else if (fileUrl != null) {
                String path = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                int dot = path.lastIndexOf(".");
                fileName = dot > 0 ? path.substring(0, dot) : path;
            }

            // fileType
            if (fileUrl != null) {
                String path = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                int dot = path.lastIndexOf(".");
                fileType = dot > 0 ? path.substring(dot + 1).toUpperCase() : null;
            }
        }

        return ApplicationResponse.builder()
                .id(form.getId())
                .userId(form.getUserId())
                .jobId(sent.getId().getJobId())
                .companyId(null)
                .companyName(null)
                .applicantName(form.getApplicantName())
                .introduction(form.getIntroduction())
                .cvFileName(fileName)
                .cvFileType(fileType)
                .cvUrl(fileUrl)
                .timeSent(sent.getTimeSent())
                .status(sent.getStatus() != null ? sent.getStatus() : ApplicationStatus.PENDING)
                .employerNote(sent.getEmployerNote())
                .build();
    }
}

package com.iting.jobportal.application.dto;

import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    private Long id;
    private String userId;
    private Long jobId;
    
    private String applicantName;
    private String cvTitle;
    private String introduction;

    private LocalDateTime timeSent;
    
    public static ApplicationResponse fromEntities(ApplyForm applyForm, ApplyFormSentToJob applyFormSentToJob) {
        return ApplicationResponse.builder()
                .id(applyForm.getId())
                .userId(applyForm.getUserId())
                .jobId(applyFormSentToJob.getId().getJobId())
                .applicantName(applyForm.getApplicantName())
                .cvTitle(applyForm.getCvTitle())
                .introduction(applyForm.getIntroduction())
                .timeSent(applyFormSentToJob.getTimeSent())
                .build();
    }
}

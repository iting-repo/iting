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
    private Long id;        // Đổi từ String thành Long
    private Long userId;    // Đổi từ String thành Long
    private Long jobId;     // Đảm bảo là Long
    private String applicantName;
    private String cvTitle;
    private String introduction;
    private LocalDateTime timeSent;

    public static ApplicationResponse fromEntities(ApplyForm applyForm, ApplyFormSentToJob applyFormSentToJob) {
        return ApplicationResponse.builder()
                .id(applyForm.getId())           // applyForm.getId() trả về Long
                .userId(applyForm.getUserId())   // applyForm.getUserId() trả về Long
                .jobId(applyFormSentToJob.getId().getJobId()) // Trả về Long
                .applicantName(applyForm.getApplicantName())
                .cvTitle(applyForm.getCvTitle())
                .introduction(applyForm.getIntroduction())
                .timeSent(applyFormSentToJob.getTimeSent())
                .build();
    }
}
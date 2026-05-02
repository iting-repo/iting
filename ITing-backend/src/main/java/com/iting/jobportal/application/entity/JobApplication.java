package com.iting.jobportal.application.entity;

import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    private Long id;

    private Long userId;

    private Long jobId;

    private Long employerId;

    // Thông tin ứng viên khi nộp đơn
    private String applicantName;

    private String applicantEmail;

    private String applicantPhone;

    // CV đính kèm
    private String cvUrl;

    private String cvTitle;

    // Thư xin việc / Giới thiệu bản thân
    private String coverLetter;

    // Trạng thái đơn ứng tuyển
    private ApplicationStatus status;

    // Ghi chú từ nhà tuyển dụng
    private String employerNote;

    // Thời gian
    private LocalDateTime appliedAt;

    private LocalDateTime viewedAt;

    private LocalDateTime updatedAt;

}

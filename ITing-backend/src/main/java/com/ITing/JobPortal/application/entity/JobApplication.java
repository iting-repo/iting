package com.iting.jobportal.application.entity;

import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "job_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "employer_id", nullable = false)
    private Long employerId;

    // Thông tin ứng viên khi nộp đơn
    @Column(length = 100)
    private String applicantName;

    @Column(length = 100)
    private String applicantEmail;

    @Column(length = 20)
    private String applicantPhone;

    // CV đính kèm
    @Column(length = 500)
    private String cvUrl;

    @Column(length = 255)
    private String cvTitle;

    // Thư xin việc / Giới thiệu bản thân
    @Column(length = 3000)
    private String coverLetter;

    // Trạng thái đơn ứng tuyển
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ApplicationStatus status;

    // Ghi chú từ nhà tuyển dụng
    @Column(length = 1000)
    private String employerNote;

    // Thời gian
    private LocalDateTime appliedAt;

    private LocalDateTime viewedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ApplicationStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class UserReport extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reporterId;  // Người báo cáo

    @Column(nullable = false)
    private Long reportedUserId;  // Người bị báo cáo

    @Column(nullable = false, length = 50)
    private String type;  // SPAM, HARASSMENT, FAKE_INFO, SCAM, OTHER

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(length = 1000)
    private String description;

    @Column(length = 50)
    private String status;  // PENDING, REVIEWING, RESOLVED, DISMISSED

    @Column(length = 1000)
    private String adminNote;

    private Long handledBy;  // Admin xử lý

    private LocalDateTime handledAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "PENDING";
    }
}


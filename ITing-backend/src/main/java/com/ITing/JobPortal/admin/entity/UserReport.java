package com.iting.jobportal.admin.entity;

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
public class UserReport {

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

    private LocalDateTime createdAt;

    private LocalDateTime handledAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}


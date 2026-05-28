package com.iting.jobportal.admin.entity;

import com.iting.jobportal.admin.entity.enums.ReportStatus;
import com.iting.jobportal.admin.entity.enums.ReportType;
import com.iting.jobportal.admin.entity.enums.SeverityLevel;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "report_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportAccount {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // user bị report
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reported_user_id", nullable = false)
  private com.iting.jobportal.user.entity.User reportedUser;

  // có thể là user hoặc company report, tạm để id đơn giản
  @Column(name = "reporter_id")
  private Long reporterId;

  @Enumerated(EnumType.STRING)
  @Column(name = "report_type", nullable = false, length = 30)
  private ReportType reportType; // POST, JOB, COMMENT, ACCOUNT

  @Column(name = "violation", nullable = false, length = 255)
  private String violation;

  @Enumerated(EnumType.STRING)
  @Column(name = "severity", nullable = false, length = 20)
  private SeverityLevel severity; // LOW, MEDIUM, HIGH, CRITICAL

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private ReportStatus status; // PENDING, RESOLVED, REJECTED

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "handled_by")
  private Admin handledBy;

  @Column(name = "handled_at")
  private LocalDateTime handledAt;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @PrePersist
  public void prePersist() {
    createdAt = LocalDateTime.now();
    if (status == null) status = ReportStatus.PENDING;
  }
}

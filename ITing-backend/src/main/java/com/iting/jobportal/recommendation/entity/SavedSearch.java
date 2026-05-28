package com.iting.jobportal.recommendation.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

/**
 * Lưu lại 1 tìm kiếm việc làm của candidate kèm tùy chọn nhận email alert khi có job mới match.
 * Periodic scheduler quét DB → gửi mail.
 */
@Entity
@Table(name = "saved_searches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedSearch {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @Column(name = "name", nullable = false, length = 120)
  private String name;

  @Column(name = "keyword", length = 255)
  private String keyword;

  @Column(name = "location", length = 255)
  private String location;

  @Column(name = "job_type", length = 30)
  private String jobType;

  @Column(name = "experience_level", length = 30)
  private String experienceLevel;

  @Column(name = "min_salary")
  private BigDecimal minSalary;

  @Column(name = "max_salary")
  private BigDecimal maxSalary;

  @Column(name = "email_alerts_enabled", nullable = false)
  @Builder.Default
  private Boolean emailAlertsEnabled = true;

  @Column(name = "alert_frequency", nullable = false, length = 20)
  @Builder.Default
  private String alertFrequency = "DAILY"; // DAILY | WEEKLY | NEVER

  @Column(name = "last_alert_sent_at")
  private LocalDateTime lastAlertSentAt;

  @Column(name = "last_matched_job_id")
  private Long lastMatchedJobId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    createdAt = updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}

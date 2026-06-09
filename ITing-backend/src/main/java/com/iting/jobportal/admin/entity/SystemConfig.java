package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "system_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // --- General Settings ---
  private String siteName;
  private String siteUrl;
  private String supportEmail;
  private Integer maxJobsPerCompany;
  private Integer jobExpiryDays;
  private Boolean autoApproveVerified;

  /** Cho phép ứng viên gửi đánh giá (review) công ty. Tắt → chặn gửi review mới toàn hệ thống. */
  private Boolean allowCompanyReviews;

  /** Giới hạn số banner QUẢNG CÁO (ADVERTISEMENT) được bật cùng lúc. Cấu hình ở trang Banner. */
  private Integer bannerAdLimit;

  // --- Email (SMTP) Settings ---
  private String smtpHost;
  private String smtpPort;
  private String smtpUser;
  private String smtpPassword;
  private String emailFromName;

  // --- Notification Settings ---
  private Boolean notifyNewCompany;
  private Boolean notifyNewJob;
  private Boolean notifyUserReport;
  private String emailDigest; // realtime, daily, weekly, off

  // --- Security Settings ---
  private Integer maxLoginAttempts;
  private Integer lockoutDuration; // minutes
  private Integer sessionTimeout; // minutes
  private Boolean requireEmailVerification;
  private Boolean enable2FA;
  private Integer minPasswordLength;

  // --- Maintenance & Backup Settings ---
  private Boolean maintenanceMode;

  @Column(columnDefinition = "TEXT")
  private String maintenanceMessage;

  private Boolean autoBackup;
  private String backupFrequency; // hourly, daily, weekly
  private Integer backupRetention; // days

  // --- Audit ---
  private LocalDateTime lastUpdate;
  private Long lastUpdatedBy;

  @PrePersist
  @PreUpdate
  public void preUpdate() {
    this.lastUpdate = LocalDateTime.now();
  }
}

package com.iting.jobportal.auth.entity;

import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.AccountType;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.common.entity.AuditEntity;
import com.iting.jobportal.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Account")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Account extends AuditEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "Id")
  private Long id;

  @Column(name = "Email", nullable = false, unique = true, length = 255)
  private String email;

  @Column(name = "Password", nullable = false, length = 255)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "Role", nullable = false, length = 20)
  private Role role = Role.CANDIDATE;

  @Enumerated(EnumType.STRING)
  @Column(name = "Status", nullable = false, length = 20)
  @Builder.Default
  private AccountStatus status = AccountStatus.PENDING;

  // Sub-role key for ADMIN accounts (e.g. "SUPER_ADMIN", "MODERATOR").
  // NULL for non-admin accounts. Will eventually be backed by V65 migration.
  // Tham chiếu tới rbac_role.code (platform role) cho tài khoản INTERNAL_STAFF.
  @Column(name = "admin_role", length = 50)
  private String adminRole;

  // Phân loại nguồn gốc tài khoản (V113) — chặn user công khai nhận role nội bộ.
  // PUBLIC = candidate đăng ký công khai; COMPANY_STAFF = HR công ty; INTERNAL_STAFF = nhân sự ITing.
  @Enumerated(EnumType.STRING)
  @Column(name = "account_type", nullable = false, length = 20)
  @Builder.Default
  private AccountType accountType = AccountType.PUBLIC;

  // Common identity fields (added by V54). Nullable until V54 backfills.
  @Column(name = "full_name", length = 255)
  private String fullName;

  @Column(name = "phone", length = 20)
  private String phone;

  @Column(name = "avatar_url", columnDefinition = "TEXT")
  private String avatarUrl;

  @Column(name = "last_login_at")
  private LocalDateTime lastLoginAt;

  // 2FA (TOTP / Google Authenticator) — bắt buộc cho tài khoản nội bộ ITing.
  @Column(name = "two_factor_secret", length = 64)
  private String twoFactorSecret;

  @Column(name = "two_factor_enabled", nullable = false)
  @Builder.Default
  private Boolean twoFactorEnabled = false;

  // Brute-force protection (added by V69).
  @Column(name = "failed_login_attempts", nullable = false)
  @Builder.Default
  private Integer failedLoginAttempts = 0;

  @Column(name = "locked_until")
  private LocalDateTime lockedUntil;

  // Marketing attribution captured at signup (added by V71).
  @Column(name = "utm_source", length = 100)
  private String utmSource;

  @Column(name = "utm_medium", length = 100)
  private String utmMedium;

  @Column(name = "utm_campaign", length = 200)
  private String utmCampaign;

  @Column(name = "utm_term", length = 200)
  private String utmTerm;

  @Column(name = "utm_content", length = 200)
  private String utmContent;

  @Column(name = "referrer_url", length = 500)
  private String referrerUrl;

  @Column(name = "landing_page", length = 500)
  private String landingPage;

  @Column(name = "signup_ip", length = 64)
  private String signupIp;

  @Column(name = "signup_user_agent", length = 500)
  private String signupUserAgent;

  // Premium tier (added by V74). NULL = free tier.
  @Column(name = "premium_until")
  private LocalDateTime premiumUntil;

  @Column(name = "premium_source", length = 50)
  private String premiumSource;

  // HR credits for premium features (added by V101).
  @Column(name = "credits", nullable = false)
  @Builder.Default
  private Integer credits = 0;

  @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private User user;

  // NOTE: relation @OneToOne tới Company đã bị bỏ.
  // Sau Phase 2, 1 Account (HR) liên kết tới Company qua bảng company_hr_affiliations
  // (N HR có thể cùng thuộc 1 Company). Resolve company qua AuthorizationService.
}

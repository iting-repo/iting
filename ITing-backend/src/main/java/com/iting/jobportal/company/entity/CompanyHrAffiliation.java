package com.iting.jobportal.company.entity;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.common.entity.AuditEntity;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Liên kết HR (Account role EMPLOYER) ↔ Company.
 *
 * <p>Mỗi HR có 1 record active duy nhất (status IN INCOMPLETE/PENDING/APPROVED). Một Company có thể
 * có N affiliation (N HR cùng thuộc 1 công ty).
 *
 * <p>Snapshot fields (submitted_*) lưu thông tin HR đã submit qua FoundingInfoTab. Khi affiliation
 * đầu tiên của Company được APPROVED → snapshot tự động được apply lên Company (xem
 * AdminAffiliationService.approve). Các affiliation sau APPROVED không tự apply — phải qua endpoint
 * /apply-to-company sau khi HR gọi tổng đài.
 */
@Entity
@Table(
    name = "company_hr_affiliations",
    indexes = {
      @Index(name = "idx_aff_hr", columnList = "hr_account_id"),
      @Index(name = "idx_aff_company", columnList = "company_id"),
      @Index(name = "idx_aff_status", columnList = "status"),
      @Index(name = "idx_aff_sub_status", columnList = "submission_status")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CompanyHrAffiliation extends AuditEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "hr_account_id", nullable = false)
  private Account hrAccount;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "company_id", nullable = false)
  private Company company;

  // ───────────────────────── Membership ─────────────────────────

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private AffiliationStatus status;

  @Column(name = "rejected_reason", columnDefinition = "TEXT")
  private String rejectedReason;

  // Company role (RBAC scope=COMPANY) gán cho HR này: SUPER_HR/HR_MANAGER/HR_RECRUITER/HR_VIEWER
  // — tham chiếu rbac_role.code (V117). NULL = chưa gán vai trò.
  @Column(name = "company_role_code", length = 60)
  private String companyRoleCode;

  @Column(name = "requested_at", nullable = false)
  private LocalDateTime requestedAt;

  @Column(name = "reviewed_at")
  private LocalDateTime reviewedAt;

  @Column(name = "reviewed_by")
  private Long reviewedBy;

  // ─────────────────── Snapshot (HR submitted) ──────────────────

  @Column(name = "submitted_name", length = 255)
  private String submittedName;

  @Column(name = "submitted_logo_url", columnDefinition = "TEXT")
  private String submittedLogoUrl;

  @Column(name = "submitted_description", columnDefinition = "TEXT")
  private String submittedDescription;

  @Column(name = "submitted_website", columnDefinition = "TEXT")
  private String submittedWebsite;

  @Column(name = "submitted_address", length = 500)
  private String submittedAddress;

  /** JSON array string, ví dụ: ["IT","FINANCE"]. NULL nếu HR chưa nhập. */
  @Column(name = "submitted_industries", columnDefinition = "TEXT")
  private String submittedIndustriesJson;

  @Column(name = "submitted_company_size", length = 50)
  private String submittedCompanySize;

  @Column(name = "submitted_phone", length = 20)
  private String submittedPhone;

  @Column(name = "submitted_company_email", length = 255)
  private String submittedCompanyEmail;

  @Column(name = "submitted_license_url", columnDefinition = "TEXT")
  private String submittedLicenseUrl;

  @Column(name = "submitted_consent_url", columnDefinition = "TEXT")
  private String submittedConsentUrl;

  @lombok.Builder.Default
  @Column(name = "submitted_consent_confirmed", nullable = false)
  private Boolean submittedConsentConfirmed = false;

  // ──────────────────── Submission review ───────────────────────

  @Enumerated(EnumType.STRING)
  @Column(name = "submission_status", nullable = false, length = 20)
  private SubmissionStatus submissionStatus;

  @Column(name = "submission_submitted_at")
  private LocalDateTime submissionSubmittedAt;

  @Column(name = "submission_reviewed_at")
  private LocalDateTime submissionReviewedAt;

  @Column(name = "submission_reviewed_by")
  private Long submissionReviewedBy;

  @Column(name = "submission_reject_reason", columnDefinition = "TEXT")
  private String submissionRejectReason;

  /** Thời điểm snapshot này được apply lên Company gần nhất. NULL nếu chưa từng. */
  @Column(name = "applied_to_company_at")
  private LocalDateTime appliedToCompanyAt;

  // ───────── Per-part review: info / license / consent (V120) ─────────
  // HR gửi từng phần độc lập; admin duyệt/từ chối từng phần. Đủ 3 APPROVED → assign-to-company.

  @Enumerated(EnumType.STRING)
  @Column(name = "info_status", nullable = false, length = 20)
  @lombok.Builder.Default
  private SubmissionStatus infoStatus = SubmissionStatus.NONE;

  @Enumerated(EnumType.STRING)
  @Column(name = "license_status", nullable = false, length = 20)
  @lombok.Builder.Default
  private SubmissionStatus licenseStatus = SubmissionStatus.NONE;

  @Enumerated(EnumType.STRING)
  @Column(name = "consent_status", nullable = false, length = 20)
  @lombok.Builder.Default
  private SubmissionStatus consentStatus = SubmissionStatus.NONE;

  @Column(name = "info_reject_reason", columnDefinition = "TEXT")
  private String infoRejectReason;

  @Column(name = "license_reject_reason", columnDefinition = "TEXT")
  private String licenseRejectReason;

  @Column(name = "consent_reject_reason", columnDefinition = "TEXT")
  private String consentRejectReason;
}

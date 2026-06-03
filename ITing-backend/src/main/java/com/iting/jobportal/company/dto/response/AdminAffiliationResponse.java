package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho admin xem chi tiết / list affiliation. Bao gồm thông tin HR + Company hiện tại + snapshot
 * HR submit (admin đối chiếu khi duyệt).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAffiliationResponse {

  private Long id;

  // ─ HR
  private Long hrAccountId;
  private String hrEmail;
  private String hrFullName;

  // ─ Company hiện tại (đã APPROVED, public)
  private Long companyId;
  private String companyName;
  private String companyTaxCode;
  private String companyLogoUrl;
  private boolean isInfoSource;

  // ─ Lifecycle
  private AffiliationStatus status;
  private SubmissionStatus submissionStatus;
  private String submissionRejectReason;
  private String rejectedReason;
  private LocalDateTime requestedAt;
  private LocalDateTime submissionSubmittedAt;
  private LocalDateTime submissionReviewedAt;
  private Long submissionReviewedBy;
  private LocalDateTime reviewedAt;
  private Long reviewedBy;
  private LocalDateTime appliedToCompanyAt;

  // ─ Snapshot HR đã submit (cho admin đối chiếu)
  private String submittedName;
  private String submittedLogoUrl;
  private String submittedDescription;
  private String submittedWebsite;
  private String submittedAddress;
  private List<String> submittedIndustries;
  private String submittedCompanySize;
  private String submittedPhone;
  private String submittedCompanyEmail;
  private String submittedLicenseUrl;
  private String submittedConsentUrl;
  private Boolean submittedConsentConfirmed;

  // ─ Fresh presigned URLs (15 phút) — admin preview ngay trong 1 GET, không gọi 3 endpoint riêng.
  private String licensePreviewUrl;
  private String consentPreviewUrl;
  private String logoPreviewUrl;

  // ─ Tóm tắt độ đầy đủ giấy tờ (để admin biết HR đã upload đủ chưa khi duyệt)
  private boolean hasLicense;
  private boolean hasConsent;
  private boolean documentsComplete; // license + consent + confirmed
}

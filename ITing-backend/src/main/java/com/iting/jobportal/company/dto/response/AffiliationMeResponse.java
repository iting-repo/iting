package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Trạng thái + snapshot affiliation của HR đang login. Dùng cho FoundingInfoTab + Verification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffiliationMeResponse {

    private Long affiliationId;
    private Long companyId;
    private String companyName;            // Tên Company hiện đang public
    private String companyLogoUrl;
    private String companyTaxCode;

    /** true nếu snapshot affiliation này đang là nguồn của Company info hiển thị. */
    private boolean infoSource;

    private AffiliationStatus status;
    private SubmissionStatus submissionStatus;
    private String submissionRejectReason;
    private LocalDateTime submissionSubmittedAt;
    private LocalDateTime submissionReviewedAt;
    private LocalDateTime appliedToCompanyAt;

    // ─ Snapshot (HR đã nhập)
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
}

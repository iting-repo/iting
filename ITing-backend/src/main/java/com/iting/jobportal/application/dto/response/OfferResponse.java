package com.iting.jobportal.application.dto.response;

import com.iting.jobportal.application.entity.OfferLetter;
import com.iting.jobportal.application.entity.enums.OfferStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class OfferResponse {

    private Long id;
    private Long applyFormId;
    private Long jobId;
    private Long candidateAccountId;
    private Long companyId;
    private Long createdByHrId;

    // Display fields — denormalized
    private String candidateName;
    private String candidateEmail;
    private String jobTitle;
    private String companyName;
    private String companyLogo;

    // Terms
    private String position;
    private BigDecimal salaryAmount;
    private String salaryCurrency;
    private String salaryType;
    private LocalDate startDate;
    private LocalDateTime expiresAt;
    private String notes;

    // Lifecycle
    private OfferStatus status;
    private String pdfFileUrl;
    private LocalDateTime sentAt;
    private LocalDateTime respondedAt;
    private LocalDateTime revokedAt;
    private String candidateResponseNote;
    private LocalDateTime createdAt;

    public static OfferResponse fromEntity(OfferLetter o) {
        return OfferResponse.builder()
                .id(o.getId())
                .applyFormId(o.getApplyFormId())
                .jobId(o.getJobId())
                .candidateAccountId(o.getCandidateAccountId())
                .companyId(o.getCompanyId())
                .createdByHrId(o.getCreatedByHrId())
                .position(o.getPosition())
                .salaryAmount(o.getSalaryAmount())
                .salaryCurrency(o.getSalaryCurrency())
                .salaryType(o.getSalaryType())
                .startDate(o.getStartDate())
                .expiresAt(o.getExpiresAt())
                .notes(o.getNotes())
                .status(o.getStatus())
                .pdfFileUrl(o.getPdfFileUrl())
                .sentAt(o.getSentAt())
                .respondedAt(o.getRespondedAt())
                .revokedAt(o.getRevokedAt())
                .candidateResponseNote(o.getCandidateResponseNote())
                .createdAt(o.getCreatedAt())
                .build();
    }
}

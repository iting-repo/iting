package com.iting.jobportal.application.entity;

import com.iting.jobportal.application.entity.enums.OfferStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "offer_letters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apply_form_id", nullable = false)
    private Long applyFormId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "candidate_account_id", nullable = false)
    private Long candidateAccountId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "created_by_hr_id", nullable = false)
    private Long createdByHrId;

    // ─── Offer terms ───────────────────────────────────────────────
    @Column(nullable = false)
    private String position;

    @Column(name = "salary_amount", precision = 15, scale = 2)
    private BigDecimal salaryAmount;

    @Column(name = "salary_currency", length = 10)
    @Builder.Default
    private String salaryCurrency = "VND";

    @Column(name = "salary_type", length = 20)
    @Builder.Default
    private String salaryType = "MONTH";

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ─── Lifecycle ─────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OfferStatus status = OfferStatus.SENT;

    @Column(name = "pdf_file_url", columnDefinition = "TEXT")
    private String pdfFileUrl;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "candidate_response_note", columnDefinition = "TEXT")
    private String candidateResponseNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (sentAt == null) sentAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

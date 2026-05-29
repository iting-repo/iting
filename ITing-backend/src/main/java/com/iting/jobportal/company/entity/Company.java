package com.iting.jobportal.company.entity;

import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.entity.enums.Industry;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.job.entity.Job;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Company")
@Getter
@Setter
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_id")
    private Long id;

    @OneToMany(mappedBy = "company", fetch = FetchType.LAZY)
    private List<Job> jobs;

    @OneToMany(mappedBy = "company", fetch = FetchType.LAZY)
    private List<CompanyAuditLog> auditLogs;

    @OneToMany(mappedBy = "company", fetch = FetchType.LAZY)
    private List<CompanyHrAffiliation> hrAffiliations;

    /**
     * Affiliation đang là "nguồn" của info hiển thị hiện tại của Company.
     * Set khi affiliation đầu tiên APPROVED (auto-apply) hoặc admin gọi
     * /api/admin/affiliations/{id}/apply-to-company sau hotline call.
     */
    @Column(name = "info_source_affiliation_id")
    private Long infoSourceAffiliationId;

    // ===== Thông tin cơ bản =====
    @Column(name = "Name", nullable = false, length = 255)
    private String name;

    @Column(name = "Web_link", columnDefinition = "TEXT")
    private String website;

    @Column(name = "Address", length = 500)
    private String address;

    @Column(name = "Logo", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "Company_email", length = 255)
    private String companyEmail;

    // enums
    // @Column(name = "Industry", length = 255)
    // private String industry;

    // EAGER: industries thường ≤ 5 phần tử, nhiều mapper truy cập ngoài tx
    // (dashboard, admin list, public list...) — EAGER tránh LazyInit hoàn toàn.
    @ElementCollection(targetClass = Industry.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "company_industries", joinColumns = @JoinColumn(name = "company_id"))
    @Column(name = "industry")
    private List<Industry> industries;

    // enums
    @Column(name = "Company_size", length = 100)
    private String companySize;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "founded_year")
    private Integer foundedYear;



    // ===== Thông tin người đại diện =====
    @Column(name = "Representative_name", length = 255)
    private String representativeName;

    @Column(name = "Representative_gender", length = 10)
    private String representativeGender;

    @Column(name = "Representative_phone", length = 20)
    private String representativePhone;



    // ===== Thông tin pháp lý =====
    @Column(name = "Tax_code", length = 50, nullable = false, unique = true)
    private String taxCode;

    @Column(name = "Business_license_file_url", columnDefinition = "TEXT")
    private String businessLicenseFileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "Business_license_document_type", length = 100)
    private BusinessDocumentType businessLicenseDocumentType;

    @Column(name = "Business_license_preview_url", columnDefinition = "TEXT")
    private String businessLicensePreviewUrl;

    @Column(name = "Consent_document_file_url", columnDefinition = "TEXT")
    private String consentDocumentFileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "Consent_document_type", length = 100)
    private BusinessDocumentType consentDocumentType;

    @Column(name = "Consent_document_preview_url", columnDefinition = "TEXT")
    private String consentDocumentPreviewUrl;

    // ===== Xác thực =====
    @Enumerated(EnumType.STRING)
    @Column(name = "Verification_level", length = 50)
    private VerificationLevel verificationLevel = VerificationLevel.UNVERIFIED;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_info_update_status", length = 50)
    private CompanyReviewStatus companyReviewStatus = CompanyReviewStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "Document_review_status", length = 50)
    private DocumentReviewStatus documentReviewStatus = DocumentReviewStatus.MISSING;

    @Column(name = "Last_update_request_date")
    private LocalDateTime lastUpdateRequestDate;

    // ===== Hệ thống =====
    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;

    @Column(name = "Active")
    private Boolean active = true;

    @Column(name = "follower_count")
    private Long followerCount;

    @Column(name = "status_reason", columnDefinition = "TEXT")
    private String statusReason;

    @Column(name = "Profile_setup")
    private Boolean profileSetup = false;

    /**
     * JSON serialize của danh sách mạng xã hội: [{"platform":"FACEBOOK","url":"..."}].
     * Dùng JSON 1 cột thay vì bảng riêng vì dữ liệu nhỏ và frontend luôn replace-all.
     * Đọc/ghi qua CompanyService.getMySocialLinks / updateMySocialLinks (đã parse).
     */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "social_links", columnDefinition = "TEXT")
    private String socialLinksJson;

    public Company() {
    }
}
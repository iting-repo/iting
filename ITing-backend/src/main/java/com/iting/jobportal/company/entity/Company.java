package com.iting.jobportal.company.entity;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
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
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "company_id")
    private Account account;

    @OneToMany(mappedBy = "company", fetch = FetchType.LAZY)
    private List<Job> jobs;

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

    @Column(name = "Industry", length = 255)
    private String industry;

    @Column(name = "Company_size", length = 100)
    private String companySize;

    @Column(name = "Phone", length = 20)
    private String phone;

    // ===== Thông tin người đại diện =====
    @Column(name = "Representative_name", length = 255)
    private String representativeName;

    @Column(name = "Representative_gender", length = 10)
    private String representativeGender;

    @Column(name = "Representative_phone", length = 20)
    private String representativePhone;

    @Column(name = "Account_email", length = 255)
    private String accountEmail;

    // ===== Thông tin pháp lý =====
    @Column(name = "Tax_code", length = 50)
    private String taxCode;

    @Column(name = "Business_license_file_url", columnDefinition = "TEXT")
    private String businessLicenseFileUrl;

    @Column(name = "Consent_document_file_url", columnDefinition = "TEXT")
    private String consentDocumentFileUrl;

    // ===== Xác thực =====
    @Enumerated(EnumType.STRING)
    @Column(name = "Verification_level", length = 50)
    private VerificationLevel verificationLevel = VerificationLevel.UNVERIFIED;

    @Enumerated(EnumType.STRING)
    @Column(name = "Company_info_update_status", length = 50)
    private CompanyReviewStatus companyInfoUpdateStatus = CompanyReviewStatus.DRAFT;

    @Column(name = "Last_update_request_date")
    private LocalDateTime lastUpdateRequestDate;

    // ===== Hệ thống =====
    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;

    @Column(name = "Active")
    private Boolean active = true;

    @Column(name = "follower_count")
    private Long followerCount;

    public Company() {
    }
}
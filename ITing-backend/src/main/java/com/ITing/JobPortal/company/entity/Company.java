package com.iting.jobportal.company.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import com.iting.jobportal.auth.entity.Account;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company {

    @Id
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id")
    private Account account;

    // ===== Thông tin cơ bản =====
    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 1000)
    private String logoUrl;

    @Column(length = 500)
    private String address;

    @Column(length = 2000)
    private String description;

    @Column(length = 255)
    private String website;

    @Column(length = 255)
    private String companyEmail;

    @Column(length = 255)
    private String industry;

    @Column(length = 50)
    private String companySize;

    @Column(length = 20)
    private String phone;

    // ===== Thông tin người đại diện =====
    @Column(length = 255)
    private String representativeName;

    @Column(length = 20)
    private String representativeGender;

    @Column(length = 20)
    private String representativePhone;

    @Column(length = 255)
    private String accountEmail;

    // ===== Thông tin pháp lý =====
    @Column(length = 100)
    private String taxCode;

    @Column(length = 1000)
    private String businessLicenseFileUrl;

    @Column(length = 1000)
    private String consentDocumentFileUrl;

    // ===== Xác thực =====
    private Integer verificationLevel;

    @Column(length = 255)
    private String companyInfoUpdateStatus;

    private LocalDateTime lastUpdateRequestDate;

    // ===== Hệ thống =====
    private LocalDateTime lastUpdate;

    private Boolean active = true;

    public Company() {
    }

    // ===== GETTERS & SETTERS =====

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getRepresentativeName() {
        return representativeName;
    }

    public void setRepresentativeName(String representativeName) {
        this.representativeName = representativeName;
    }

    public String getRepresentativeGender() {
        return representativeGender;
    }

    public void setRepresentativeGender(String representativeGender) {
        this.representativeGender = representativeGender;
    }

    public String getRepresentativePhone() {
        return representativePhone;
    }

    public void setRepresentativePhone(String representativePhone) {
        this.representativePhone = representativePhone;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public String getBusinessLicenseFileUrl() {
        return businessLicenseFileUrl;
    }

    public void setBusinessLicenseFileUrl(String businessLicenseFileUrl) {
        this.businessLicenseFileUrl = businessLicenseFileUrl;
    }

    public String getConsentDocumentFileUrl() {
        return consentDocumentFileUrl;
    }

    public void setConsentDocumentFileUrl(String consentDocumentFileUrl) {
        this.consentDocumentFileUrl = consentDocumentFileUrl;
    }

    public Integer getVerificationLevel() {
        return verificationLevel;
    }

    public void setVerificationLevel(Integer verificationLevel) {
        this.verificationLevel = verificationLevel;
    }

    public String getCompanyInfoUpdateStatus() {
        return companyInfoUpdateStatus;
    }

    public void setCompanyInfoUpdateStatus(String companyInfoUpdateStatus) {
        this.companyInfoUpdateStatus = companyInfoUpdateStatus;
    }

    public LocalDateTime getLastUpdateRequestDate() {
        return lastUpdateRequestDate;
    }

    public void setLastUpdateRequestDate(LocalDateTime lastUpdateRequestDate) {
        this.lastUpdateRequestDate = lastUpdateRequestDate;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(LocalDateTime lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}

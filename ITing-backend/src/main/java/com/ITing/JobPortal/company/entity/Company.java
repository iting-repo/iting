package com.iting.jobportal.company.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Company")
@Getter
@Setter
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Company_id")
    private Long id;

    // ===== Thông tin cơ bản =====
    @Column(name = "Name", nullable = false, length = 255)
    private String name;

    @Column(name = "Logo", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "Address", length = 500)
    private String address;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "Web_link", columnDefinition = "TEXT")
    private String website;

    @Transient
    private String companyEmail;

    @Transient
    private String industry;

    @Transient
    private String companySize;

    @Transient
    private String phone;

    // ===== Thông tin người đại diện =====
    @Transient
    private String representativeName;

    @Transient
    private String representativeGender;

    @Transient
    private String representativePhone;

    @Transient
    private String accountEmail;

    // ===== Thông tin pháp lý =====
    @Transient
    private String taxCode;

    @Transient
    private String businessLicenseFileUrl;

    @Transient
    private String consentDocumentFileUrl;

    // ===== Xác thực =====
    @Transient
    private Integer verificationLevel;

    @Transient
    private String companyInfoUpdateStatus;

    @Transient
    private LocalDateTime lastUpdateRequestDate;

    // ===== Hệ thống =====
    @Column(name = "Last_update")
    private LocalDateTime lastUpdate;

    @Transient
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

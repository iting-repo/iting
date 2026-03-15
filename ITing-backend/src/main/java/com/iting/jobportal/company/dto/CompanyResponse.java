package com.iting.jobportal.company.dto;

import java.time.LocalDateTime;

public class CompanyResponse {

    private Long id;
    private String name;
    private String logoUrl;
    private String address;
    private String description;
    private String website;
    private String companyEmail;
    private String industry;
    private String companySize;

    private String representativeName;
    private String representativeGender;
    private String representativePhone;
    private String accountEmail;

    private String taxCode;
    private String businessLicenseFileUrl;
    private String consentDocumentFileUrl;

    private Integer verificationLevel;
    private String companyInfoUpdateStatus;
    private LocalDateTime lastUpdateRequestDate;

    private LocalDateTime lastUpdate;
    private Boolean active;
    private Long followerCount;

    public CompanyResponse() {
    }

    public CompanyResponse(Long id,
            String name,
            String logoUrl,
            String address,
            String description,
            String website,
            String companyEmail,
            String industry,
            String companySize,
            String representativeName,
            String representativeGender,
            String representativePhone,
            String accountEmail,
            String taxCode,
            String businessLicenseFileUrl,
            String consentDocumentFileUrl,
            Integer verificationLevel,
            String companyInfoUpdateStatus,
            LocalDateTime lastUpdateRequestDate,
            LocalDateTime lastUpdate,
            Boolean active) {

        this.id = id;
        this.name = name;
        this.logoUrl = logoUrl;
        this.address = address;
        this.description = description;
        this.companyEmail = companyEmail;
        this.website = website;
        this.industry = industry;
        this.companySize = companySize;

        this.representativeName = representativeName;
        this.representativeGender = representativeGender;
        this.representativePhone = representativePhone;
        this.accountEmail = accountEmail;

        this.taxCode = taxCode;
        this.businessLicenseFileUrl = businessLicenseFileUrl;
        this.consentDocumentFileUrl = consentDocumentFileUrl;

        this.verificationLevel = verificationLevel;
        this.companyInfoUpdateStatus = companyInfoUpdateStatus;
        this.lastUpdateRequestDate = lastUpdateRequestDate;

        this.lastUpdate = lastUpdate;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public String getAddress() {
        return address;
    }

    public String getDescription() {
        return description;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public String getWebsite() {
        return website;
    }

    public String getIndustry() {
        return industry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public String getRepresentativeName() {
        return representativeName;
    }

    public String getRepresentativeGender() {
        return representativeGender;
    }

    public String getRepresentativePhone() {
        return representativePhone;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public String getBusinessLicenseFileUrl() {
        return businessLicenseFileUrl;
    }

    public String getConsentDocumentFileUrl() {
        return consentDocumentFileUrl;
    }

    public Integer getVerificationLevel() {
        return verificationLevel;
    }

    public String getCompanyInfoUpdateStatus() {
        return companyInfoUpdateStatus;
    }

    public LocalDateTime getLastUpdateRequestDate() {
        return lastUpdateRequestDate;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public Boolean getActive() {
        return active;
    }

    public Long getFollowerCount() {
        return followerCount;
    }

    public void setFollowerCount(Long followerCount) {
        this.followerCount = followerCount;
    }

}

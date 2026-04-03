package com.iting.jobportal.company.dto.request;

import com.iting.jobportal.company.entity.enums.Industry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CompanyUpdateRequest {

    // ===== Thông tin cơ bản =====

    @NotBlank(message = "Company name must not be blank")
    private String name;

    @Size(max = 1000, message = "Logo URL must be at most 1000 characters")
    private String logoUrl;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @Size(max = 2000, message = "Description must be at most 2000 characters")
    private String description;

    @Size(max = 255, message = "Website link must be at most 255 characters")
    private String website;

    private List<Industry> industries;

    @Size(max = 50, message = "Company size must be at most 50 characters")
    private String companySize;

    // ===== Người đại diện =====

    @Size(max = 255, message = "Representative name must be at most 255 characters")
    private String representativeName;

    @Size(max = 20, message = "Gender must be at most 20 characters")
    private String representativeGender;

    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String representativePhone;

    @Size(max = 255, message = "Email must be at most 255 characters")
    private String accountEmail;

    // ===== Pháp lý =====

    @Size(max = 100, message = "Tax code must be at most 100 characters")
    private String taxCode;

    @Size(max = 1000, message = "Business license file URL must be at most 1000 characters")
    private String businessLicenseFileUrl;

    @Size(max = 1000, message = "Consent document file URL must be at most 1000 characters")
    private String consentDocumentFileUrl;

    // ===== Xác thực =====

    private Integer verificationLevel;

    @Size(max = 255, message = "Update status must be at most 255 characters")
    private String companyInfoUpdateStatus;

    private Boolean active;

    public CompanyUpdateRequest() {
    }

    // ======================
    // GETTERS
    // ======================

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

    public String getWebsite() {
        return website;
    }

    public List<Industry> getIndustries() {
        return industries;
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

    public Boolean getActive() {
        return active;
    }

    // ======================
    // SETTERS
    // ======================

    public void setName(String name) {
        this.name = name;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public void setIndustries(List<Industry> industries) {
        this.industries = industries;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public void setRepresentativeName(String representativeName) {
        this.representativeName = representativeName;
    }

    public void setRepresentativeGender(String representativeGender) {
        this.representativeGender = representativeGender;
    }

    public void setRepresentativePhone(String representativePhone) {
        this.representativePhone = representativePhone;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public void setBusinessLicenseFileUrl(String businessLicenseFileUrl) {
        this.businessLicenseFileUrl = businessLicenseFileUrl;
    }

    public void setConsentDocumentFileUrl(String consentDocumentFileUrl) {
        this.consentDocumentFileUrl = consentDocumentFileUrl;
    }

    public void setVerificationLevel(Integer verificationLevel) {
        this.verificationLevel = verificationLevel;
    }

    public void setCompanyInfoUpdateStatus(String companyInfoUpdateStatus) {
        this.companyInfoUpdateStatus = companyInfoUpdateStatus;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
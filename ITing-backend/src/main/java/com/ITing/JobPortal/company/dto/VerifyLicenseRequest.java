package com.iting.jobportal.company.dto;

import jakarta.validation.constraints.Size;

public class VerifyLicenseRequest {

    private Integer verificationLevel;

    @Size(max = 255, message = "Update status must be at most 255 characters")
    private String companyInfoUpdateStatus;

    public VerifyLicenseRequest() {
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
}

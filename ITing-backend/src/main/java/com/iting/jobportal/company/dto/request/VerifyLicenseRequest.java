package com.iting.jobportal.company.dto.request;

import com.iting.jobportal.company.entity.enums.VerificationLevel;
import jakarta.validation.constraints.Size;

public class VerifyLicenseRequest {

    private VerificationLevel verificationLevel;

    @Size(max = 255, message = "Update status must be at most 255 characters")
    private String companyInfoUpdateStatus;

    public VerifyLicenseRequest() {
    }

    public VerificationLevel getVerificationLevel() {
        return verificationLevel;
    }

    public void setVerificationLevel(VerificationLevel verificationLevel) {
        this.verificationLevel = verificationLevel;
    }

    public String getCompanyInfoUpdateStatus() {
        return companyInfoUpdateStatus;
    }

    public void setCompanyInfoUpdateStatus(String companyInfoUpdateStatus) {
        this.companyInfoUpdateStatus = companyInfoUpdateStatus;
    }
}

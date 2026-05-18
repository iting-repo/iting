package com.iting.jobportal.company.dto.request;

import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import jakarta.validation.constraints.Size;

public class VerifyLicenseRequest {

    private VerificationLevel verificationLevel;

    @Size(max = 255, message = "Update status must be at most 255 characters")
    private CompanyReviewStatus companyReviewStatus;

    public VerifyLicenseRequest() {
    }

    public VerificationLevel getVerificationLevel() {
        return verificationLevel;
    }

    public void setVerificationLevel(VerificationLevel verificationLevel) {
        this.verificationLevel = verificationLevel;
    }

    public CompanyReviewStatus getCompanyReviewStatus() {
        return companyReviewStatus;
    }

    public void setCompanyReviewStatus(CompanyReviewStatus companyReviewStatus) {
        this.companyReviewStatus = companyReviewStatus;
    }
}

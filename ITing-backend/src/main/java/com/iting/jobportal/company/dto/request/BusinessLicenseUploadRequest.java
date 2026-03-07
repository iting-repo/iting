package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BusinessLicenseUploadRequest {

    @NotBlank(message = "Business license file URL cannot be empty")
    @Size(max = 1000, message = "File URL must be at most 1000 characters")
    private String businessLicenseFileUrl;

    public BusinessLicenseUploadRequest() {
    }

    public String getBusinessLicenseFileUrl() {
        return businessLicenseFileUrl;
    }

    public void setBusinessLicenseFileUrl(String businessLicenseFileUrl) {
        this.businessLicenseFileUrl = businessLicenseFileUrl;
    }
}

package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ConsentDocumentUploadRequest {

    @NotBlank(message = "Consent document file URL cannot be empty")
    @Size(max = 1000, message = "File URL must be at most 1000 characters")
    private String consentDocumentFileUrl;

    public ConsentDocumentUploadRequest() {
    }

    public String getConsentDocumentFileUrl() {
        return consentDocumentFileUrl;
    }

    public void setConsentDocumentFileUrl(String consentDocumentFileUrl) {
        this.consentDocumentFileUrl = consentDocumentFileUrl;
    }
}

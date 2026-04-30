package com.iting.jobportal.userprofile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CertificateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Issuing organization is required")
    private String issuingOrganization;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    private LocalDate expirationDate;

    private String credentialId;

    private String credentialUrl;

    private Boolean doesNotExpire = false;
}

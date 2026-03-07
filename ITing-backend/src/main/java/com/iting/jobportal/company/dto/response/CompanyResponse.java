package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.enums.VerificationLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    private VerificationLevel verificationLevel;
    private String companyInfoUpdateStatus;
    private LocalDateTime lastUpdateRequestDate;

    private LocalDateTime lastUpdate;
    private Boolean active;
}
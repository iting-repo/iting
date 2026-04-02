package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
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
    private String phone;
    private String representativeName;
    private String representativeGender;
    private String representativePhone;
    private String accountEmail;

    private String taxCode;
    private String businessLicenseFileUrl;
    private BusinessDocumentType businessLicenseDocumentType;
    private String businessLicensePreviewUrl;
    private String consentDocumentFileUrl;

    private VerificationLevel verificationLevel;
    private CompanyReviewStatus companyInfoUpdateStatus;
    private LocalDateTime lastUpdateRequestDate;

    private LocalDateTime lastUpdate;
    private Boolean active;

    public static CompanyResponse fromEntity(com.iting.jobportal.company.entity.Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getLogoUrl(),
                company.getAddress(),
                company.getDescription(),
                company.getWebsite(),
                company.getCompanyEmail(),
                company.getIndustry(),
                company.getCompanySize(),
                company.getPhone(),
                company.getRepresentativeName(),
                company.getRepresentativeGender(),
                company.getRepresentativePhone(),
                company.getAccountEmail(),
                company.getTaxCode(),
                company.getBusinessLicenseFileUrl(),
                company.getBusinessLicenseDocumentType(),
                company.getBusinessLicensePreviewUrl(),
                company.getConsentDocumentFileUrl(),
                company.getVerificationLevel(),
                company.getCompanyInfoUpdateStatus(),
                company.getLastUpdateRequestDate(),
                company.getLastUpdate(),
                company.getActive()
        );
    }
}
package com.iting.jobportal.company.dto.response;

import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BusinessLicenseFormResponse {
    private Long companyId;
    private BusinessDocumentType documentType;
    private String businessLicenseFileUrl;
    private String businessLicensePreviewUrl;
    private CompanyReviewStatus companyInfoUpdateStatus;
}
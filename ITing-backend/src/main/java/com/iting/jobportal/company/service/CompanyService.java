package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.request.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.request.CompanyBasicInfoRequest;
import com.iting.jobportal.company.dto.request.CompanyRepresentativeRequest;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.dto.request.ConsentDocumentUploadRequest;
import com.iting.jobportal.company.dto.request.VerifyLicenseRequest;
import com.iting.jobportal.company.dto.request.VerifyPhoneRequest;

public interface CompanyService {
    CompanyResponse getCompanyById(Long id);

    CompanyResponse getMyCompany(Long accountId);

//    CompanyResponse getCompanyByUserId(Long userId);

    // (A) Basic Info
    CompanyResponse updateBasicInfo(Long id, CompanyBasicInfoRequest request);

    // (B) Representative
    CompanyResponse updateRepresentative(Long id, CompanyRepresentativeRequest request);

    // (C) Business License Upload
    CompanyResponse updateBusinessLicense(Long id, BusinessLicenseUploadRequest request);

    // (D) Consent Document Upload
    CompanyResponse updateConsentDocument(Long id, ConsentDocumentUploadRequest request);

    // (E) Verify Phone
    void verifyPhone(Long id, VerifyPhoneRequest request);

    // (F) Verify License Info
    CompanyResponse verifyLicense(Long id, VerifyLicenseRequest request);

    // (G) Submit for Review
    CompanyResponse submitForReview(Long id);
}
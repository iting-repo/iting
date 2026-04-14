package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.request.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.request.CompanyBasicInfoRequest;
import com.iting.jobportal.company.dto.request.CompanyRepresentativeRequest;
import com.iting.jobportal.company.dto.response.BusinessLicenseFormResponse;
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

    BusinessLicenseFormResponse getBusinessLicenseForm(Long id);

    // (D) Consent Document Upload
    CompanyResponse updateConsentDocument(Long id, ConsentDocumentUploadRequest request);

    // (E) Verify Phone
    void verifyPhone(Long id, VerifyPhoneRequest request);

    // (F) Verify License Info
    CompanyResponse verifyLicense(Long id, VerifyLicenseRequest request);

    // (G) Submit for Review
    CompanyResponse submitInfoReview(Long id);
    CompanyResponse submitDocumentReview(Long id);

    String getBusinessLicensePresignedUrlByAccountId(Long accountId, int minutes);

    CompanyResponse updateBasicInfoByAccountId(Long accountId, CompanyBasicInfoRequest request);
    CompanyResponse updateRepresentativeByAccountId(Long accountId, CompanyRepresentativeRequest request);
    BusinessLicenseFormResponse getBusinessLicenseFormByAccountId(Long accountId);
    CompanyResponse updateBusinessLicenseByAccountId(Long accountId, BusinessLicenseUploadRequest request);
    CompanyResponse updateConsentDocumentByAccountId(Long accountId, ConsentDocumentUploadRequest request);
    void verifyPhoneByAccountId(Long accountId, VerifyPhoneRequest request);
    CompanyResponse verifyLicenseByAccountId(Long accountId, VerifyLicenseRequest request);
    CompanyResponse submitInfoReviewByAccountId(Long accountId);
    CompanyResponse submitDocumentReviewByAccountId(Long accountId);
    CompanyResponse submitBusinessLicenseReviewByAccountId(Long accountId);
    CompanyResponse submitConsentDocumentReviewByAccountId(Long accountId);

    String uploadLogoByAccountId(Long accountId, org.springframework.web.multipart.MultipartFile file);
}
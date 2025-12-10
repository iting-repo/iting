package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.CompanyBasicInfoRequest;
import com.iting.jobportal.company.dto.CompanyRepresentativeRequest;
import com.iting.jobportal.company.dto.CompanyResponse;
import com.iting.jobportal.company.dto.ConsentDocumentUploadRequest;
import com.iting.jobportal.company.dto.VerifyLicenseRequest;
import com.iting.jobportal.company.dto.VerifyPhoneRequest;

public interface CompanyService {
    CompanyResponse getCompanyById(Long id);

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

}
package com.ITing.JobPortal.company.service;

import com.ITing.JobPortal.company.dto.BusinessLicenseUploadRequest;
import com.ITing.JobPortal.company.dto.CompanyBasicInfoRequest;
import com.ITing.JobPortal.company.dto.CompanyRepresentativeRequest;
import com.ITing.JobPortal.company.dto.CompanyResponse;
import com.ITing.JobPortal.company.dto.ConsentDocumentUploadRequest;
import com.ITing.JobPortal.company.dto.VerifyLicenseRequest;
import com.ITing.JobPortal.company.dto.VerifyPhoneRequest;


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
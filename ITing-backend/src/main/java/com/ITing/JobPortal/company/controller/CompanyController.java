package com.ITing.JobPortal.company.controller;

import com.ITing.JobPortal.company.dto.BusinessLicenseUploadRequest;
import com.ITing.JobPortal.company.dto.CompanyBasicInfoRequest;
import com.ITing.JobPortal.company.dto.CompanyResponse;
import com.ITing.JobPortal.company.dto.ConsentDocumentUploadRequest;
import com.ITing.JobPortal.company.dto.VerifyLicenseRequest;
import com.ITing.JobPortal.company.dto.VerifyPhoneRequest;




import com.ITing.JobPortal.company.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // --- (0) Get Company Info
    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    // --- (A) Update Basic Info ---
    @PutMapping("/{id}/basic-info")
    public ResponseEntity<CompanyResponse> updateBasicInfo(
            @PathVariable Long id,
            @Valid @RequestBody CompanyBasicInfoRequest request) {
        return ResponseEntity.ok(companyService.updateBasicInfo(id, request));
    }

    // --- (B) Update Representative Info ---
    @PutMapping("/{id}/representative")
    public ResponseEntity<CompanyResponse> CompanyRepresentativeRequest (
            @PathVariable Long id,
            @Valid @RequestBody com.ITing.JobPortal.company.dto.CompanyRepresentativeRequest request) {
                return ResponseEntity.ok(companyService.updateRepresentative(id, request));
            }

    // --- (C) Upload Business License ---
    @PostMapping("/{id}/business-license")
    public ResponseEntity<CompanyResponse> uploadBusinessLicense(
            @PathVariable Long id,
            @Valid @RequestBody BusinessLicenseUploadRequest request) {

        return ResponseEntity.ok(companyService.updateBusinessLicense(id, request));
    }

    // --- (D) Upload Consent Document ---
    @PostMapping("/{id}/consent-document")
    public ResponseEntity<CompanyResponse> uploadConsentDocument(
            @PathVariable Long id,
            @Valid @RequestBody ConsentDocumentUploadRequest request) {

        return ResponseEntity.ok(companyService.updateConsentDocument(id, request));
    }

    // --- (E) Verify Phone ---
    @PostMapping("{id}/verify-phone")
    public ResponseEntity<String> verifyPhone(
            @PathVariable Long id,
            @Valid @RequestBody VerifyPhoneRequest request) {

        companyService.verifyPhone(id, request);
        return ResponseEntity.ok("Phone verified successfully");
    }

    // --- (F) Verify License ---
    @PostMapping("/{id}/verify-license")
    public ResponseEntity<CompanyResponse> verifyLicense(
            @PathVariable Long id,
            @Valid @RequestBody VerifyLicenseRequest request) {

        return ResponseEntity.ok(companyService.verifyLicense(id, request));
    }


}

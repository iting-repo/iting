package com.iting.jobportal.company.controller;

import com.iting.jobportal.company.dto.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.CompanyBasicInfoRequest;
import com.iting.jobportal.company.dto.CompanyResponse;
import com.iting.jobportal.company.dto.ConsentDocumentUploadRequest;
import com.iting.jobportal.company.dto.VerifyLicenseRequest;
import com.iting.jobportal.company.dto.VerifyPhoneRequest;

import com.iting.jobportal.company.service.CompanyService;
import com.iting.jobportal.company.service.CompanyFollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@Tag(name = "Companies", description = "APIs quản lý công ty")
public class CompanyController {

    private final CompanyService companyService;
    private final CompanyFollowService companyFollowService;

    public CompanyController(CompanyService companyService, CompanyFollowService companyFollowService) {
        this.companyService = companyService;
        this.companyFollowService = companyFollowService;
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
    public ResponseEntity<CompanyResponse> CompanyRepresentativeRequest(
            @PathVariable Long id,
            @Valid @RequestBody com.iting.jobportal.company.dto.CompanyRepresentativeRequest request) {
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

    // --- Get Follower Count (Public) ---
    @GetMapping("/{id}/followers/count")
    @Operation(summary = "Lấy số lượng người theo dõi công ty")
    public ResponseEntity<Map<String, Long>> getFollowerCount(@PathVariable Long id) {
        Long count = companyFollowService.getFollowerCount(id);
        return ResponseEntity.ok(Map.of("followerCount", count));
    }

}

package com.iting.jobportal.company.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.company.dto.request.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.request.CompanyBasicInfoRequest;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.dto.request.ConsentDocumentUploadRequest;
import com.iting.jobportal.company.dto.request.VerifyLicenseRequest;
import com.iting.jobportal.company.dto.request.VerifyPhoneRequest;

import com.iting.jobportal.company.dto.request.CompanyRepresentativeRequest;
import com.iting.jobportal.company.service.CompanyService;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "09. Company    ")
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
    @GetMapping
    @Operation(summary = "Lấy thông tin công ty của tài khoản đang đăng nhập")
    public ResponseEntity<CompanyResponse> getMyCompany(@Parameter(hidden = true) @CurrentUser Long userId) {
        return ResponseEntity.ok(companyService.getMyCompany(userId));
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
            @Valid @RequestBody CompanyRepresentativeRequest request) {
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
//    @GetMapping("/{id}/followers/count")
//    @Operation(summary = "Lấy số lượng người theo dõi công ty")
//    public ResponseEntity<Map<String, Long>> getFollowerCount(@PathVariable Long id) {
//        Long count = companyFollowService.getFollowerCount(id);
//        return ResponseEntity.ok(Map.of("followerCount", count));
//    }

    // --- Get Follower Count của công ty mình (Sử dụng CurrentUser) ---
    @GetMapping("/my-followers/count") // Đổi path để tránh trùng lặp hoặc nhầm lẫn
    @Operation(summary = "Lấy số lượng người theo dõi của công ty đang đăng nhập")
    public ResponseEntity<Map<String, Long>> getMyFollowerCount(
            @Parameter(hidden = true) @CurrentUser Long userId) {

        // Bước 1: Lấy thông tin công ty từ userId
        CompanyResponse myCompany = companyService.getMyCompany(userId);

        // Bước 2: Lấy số lượng follower dựa trên ID công ty vừa tìm được
        Long count = companyFollowService.getFollowerCount(myCompany.getId());

        return ResponseEntity.ok(Map.of("followerCount", count));
    }

    // --- (G) Submit for Review ---
    @PostMapping("/{id}/submit-review")
    public ResponseEntity<CompanyResponse> submitForReview(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.submitForReview(id));
    }
}

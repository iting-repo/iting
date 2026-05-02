package com.iting.jobportal.company.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.company.dto.request.BusinessLicenseUploadRequest;
import com.iting.jobportal.company.dto.request.CompanyBasicInfoRequest;
import com.iting.jobportal.company.dto.response.BusinessLicenseFormResponse;
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
import com.iting.service.RedisRateLimitingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "09. Company    ")
@RestController
@RequestMapping("/api/companies")
@Tag(name = "Companies", description = "APIs quản lý công ty")
public class CompanyController {

    private final CompanyService companyService;
    private final CompanyFollowService companyFollowService;
    private final RedisRateLimitingService redisRateLimitingService;

    public CompanyController(CompanyService companyService, CompanyFollowService companyFollowService,
            RedisRateLimitingService redisRateLimitingService) {
        this.companyService = companyService;
        this.companyFollowService = companyFollowService;
        this.redisRateLimitingService = redisRateLimitingService;
    }

    @GetMapping("/me/business-license/view")
    @Operation(summary = "Lấy presigned URL để xem giấy phép kinh doanh của công ty đang đăng nhập")
    public ResponseEntity<Map<String, String>> viewBusinessLicense(
            @Parameter(hidden = true) @CurrentUser Long userId) {

        String presignedUrl = companyService.getBusinessLicensePresignedUrlByAccountId(userId, 15);

        return ResponseEntity.ok(Map.of("url", presignedUrl));
    }

    @PostMapping(value = "/me/consent-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload văn bản thỏa thuận dữ liệu cá nhân của tôi")
    public ResponseEntity<CompanyResponse> uploadConsentDocument(
            @Parameter(hidden = true) @CurrentUser Long userId,

            @io.swagger.v3.oas.annotations.Parameter(description = "File văn bản thỏa thuận dữ liệu cá nhân", required = true, schema = @io.swagger.v3.oas.annotations.media.Schema(type = "string", format = "binary")) @RequestPart("file") MultipartFile file,

            @RequestPart("confirmed") Boolean confirmed,

            @RequestPart(value = "version", required = false) String version) {
        ConsentDocumentUploadRequest request = new ConsentDocumentUploadRequest();
        request.setFile(file);
        request.setConfirmed(confirmed);
        request.setVersion(version);

        return ResponseEntity.ok(companyService.updateConsentDocumentByAccountId(userId, request));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin công ty của tài khoản đang đăng nhập")
    public ResponseEntity<CompanyResponse> getMyCompany(
            @Parameter(hidden = true) @CurrentUser Long userId) {
        return ResponseEntity.ok(companyService.getMyCompany(userId));
    }

    @PutMapping("/me/basic-info")
    @Operation(summary = "Cập nhật thông tin cơ bản công ty của tôi")
    public ResponseEntity<CompanyResponse> updateBasicInfo(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody CompanyBasicInfoRequest request) {
        return ResponseEntity.ok(companyService.updateBasicInfoByAccountId(userId, request));
    }

    @PutMapping("/me/representative")
    @Operation(summary = "Cập nhật thông tin người đại diện công ty của tôi")
    public ResponseEntity<CompanyResponse> updateRepresentative(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody CompanyRepresentativeRequest request) {
        return ResponseEntity.ok(companyService.updateRepresentativeByAccountId(userId, request));
    }

    @GetMapping("/me/business-license")
    @Operation(summary = "Lấy dữ liệu form giấy đăng ký doanh nghiệp của tôi")
    public ResponseEntity<BusinessLicenseFormResponse> getBusinessLicenseForm(
            @Parameter(hidden = true) @CurrentUser Long userId) {
        return ResponseEntity.ok(companyService.getBusinessLicenseFormByAccountId(userId));
    }

    @PutMapping(value = "/me/business-license", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload giấy đăng ký doanh nghiệp của tôi")
    public ResponseEntity<CompanyResponse> updateBusinessLicense(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @io.swagger.v3.oas.annotations.Parameter(description = "File PDF giấy phép kinh doanh", required = true, schema = @io.swagger.v3.oas.annotations.media.Schema(type = "string", format = "binary")) @RequestPart("file") MultipartFile file) {

        BusinessLicenseUploadRequest request = new BusinessLicenseUploadRequest();
        request.setFile(file);

        return ResponseEntity.ok(companyService.updateBusinessLicenseByAccountId(userId, request));
    }

    @PostMapping("/me/consent-document")
    @Operation(summary = "Upload văn bản thỏa thuận dữ liệu cá nhân của tôi")
    public ResponseEntity<CompanyResponse> uploadConsentDocument(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody ConsentDocumentUploadRequest request) {
        return ResponseEntity.ok(companyService.updateConsentDocumentByAccountId(userId, request));
    }

    @PostMapping("/me/verify-phone")
    @Operation(summary = "Xác thực số điện thoại công ty của tôi")
    public ResponseEntity<String> verifyPhone(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody VerifyPhoneRequest request) {
        companyService.verifyPhoneByAccountId(userId, request);
        return ResponseEntity.ok("Phone verified successfully");
    }

    @PostMapping("/me/verify-license")
    @Operation(summary = "Xác thực giấy tờ công ty của tôi")
    public ResponseEntity<CompanyResponse> verifyLicense(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @Valid @RequestBody VerifyLicenseRequest request) {
        return ResponseEntity.ok(companyService.verifyLicenseByAccountId(userId, request));
    }

    @GetMapping("/my-followers/count")
    @Operation(summary = "Lấy số lượng người theo dõi của công ty đang đăng nhập")
    public ResponseEntity<Map<String, Long>> getMyFollowerCount(
            @Parameter(hidden = true) @CurrentUser Long userId) {

        CompanyResponse myCompany = companyService.getMyCompany(userId);
        Long count = companyFollowService.getFollowerCount(myCompany.getId());

        return ResponseEntity.ok(Map.of("followerCount", count));
    }

    @PostMapping("/me/submit-info-review")
    @Operation(summary = "Gửi duyệt thông tin cơ bản công ty của tôi")
    public ResponseEntity<?> submitInfoReview(
            @Parameter(hidden = true) @CurrentUser Long userId) {

        if (!redisRateLimitingService.isAllowed(String.valueOf(userId), "submit_info", 1, 300)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Bạn thao tác quá nhanh. Vui lòng thử lại sau 5 phút."));
        }

        return ResponseEntity.ok(companyService.submitInfoReviewByAccountId(userId));
    }

    @PostMapping("/me/submit-document-review")
    @Operation(summary = "Gửi duyệt toàn bộ giấy tờ pháp lý công ty của tôi")
    public ResponseEntity<CompanyResponse> submitDocumentReview(
            @Parameter(hidden = true) @CurrentUser Long userId) {
        return ResponseEntity.ok(companyService.submitDocumentReviewByAccountId(userId));
    }

    @PostMapping("/me/submit-business-license-review")
    @Operation(summary = "Gửi duyệt Giấy phép kinh doanh của tôi (độc lập)")
    public ResponseEntity<CompanyResponse> submitBusinessLicenseReview(
            @Parameter(hidden = true) @CurrentUser Long userId) {
        return ResponseEntity.ok(companyService.submitBusinessLicenseReviewByAccountId(userId));
    }

    @PostMapping("/me/submit-consent-document-review")
    @Operation(summary = "Gửi duyệt Văn bản thỏa thuận dữ liệu cá nhân của tôi (độc lập)")
    public ResponseEntity<CompanyResponse> submitConsentDocumentReview(
            @Parameter(hidden = true) @CurrentUser Long userId) {
        return ResponseEntity.ok(companyService.submitConsentDocumentReviewByAccountId(userId));
    }

    @PostMapping(value = "/me/logo/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload logo công ty của tôi")
    public ResponseEntity<Map<String, String>> uploadLogo(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @RequestPart("file") MultipartFile file) {
        String url = companyService.uploadLogoByAccountId(userId, file);
        return ResponseEntity.ok(Map.of("logoUrl", url));
    }
}
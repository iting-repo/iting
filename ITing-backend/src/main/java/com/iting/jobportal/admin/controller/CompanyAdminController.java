package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.service.*;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
@Tag(name = "Admin Company Management", description = "APIs for admin to manage company approvals")
public class CompanyAdminController {

    private final AdminCompanyService adminCompanyService;

    /*
    ================================
    DANH SÁCH CÔNG TY
    ================================
    */

    @GetMapping
    @Operation(summary = "Lấy danh sách công ty (có filter)")
    public ResponseEntity<Page<CompanyResponse>> getCompanies(
            @RequestParam(required = false) CompanyReviewStatus status,
            @RequestParam(required = false) VerificationLevel verificationLevel,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CompanyResponse> companies =
                adminCompanyService.filterCompanies(status, verificationLevel, active, keyword, page, size);

        return ResponseEntity.ok(companies);
    }

    /*
    ================================
    CHI TIẾT CÔNG TY
    ================================
    */

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết công ty")
    public ResponseEntity<CompanyResponse> getCompanyDetail(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(adminCompanyService.getCompanyDetail(id));
    }

    @GetMapping("/filter")
    @Operation(summary = "Lọc công ty theo trạng thái review và mức xác thực")
    public ResponseEntity<Page<CompanyResponse>> filterCompanies(
            @RequestParam(required = false) CompanyReviewStatus status,
            @RequestParam(required = false) VerificationLevel verificationLevel,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                adminCompanyService.filterCompanies(status, verificationLevel, active, keyword, page, size)
        );
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Duyệt công ty")
    public ResponseEntity<?> approveCompany(
            @PathVariable Long id,
            @RequestBody CompanyApprovalRequest request) {
        // In a real app, adminId would come from SecurityContext
        Long adminId = 1L; 
        adminCompanyService.approveCompany(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company approved successfully"));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Từ chối công ty")
    public ResponseEntity<?> rejectCompany(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {
        Long adminId = 1L;
        adminCompanyService.rejectCompany(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company rejected successfully"));
    }

    @PostMapping("/{id}/request-resubmission")
    @Operation(summary = "Yêu cầu bổ sung hồ sơ")
    public ResponseEntity<?> requestResubmission(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {
        Long adminId = 1L;
        adminCompanyService.requestCompanyResubmission(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Resubmission requested successfully"));
    }

    @PostMapping("/{id}/suspend")
    @Operation(summary = "Đình chỉ công ty")
    public ResponseEntity<?> suspendCompany(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {
        Long adminId = 1L;
        adminCompanyService.suspendCompany(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company suspended successfully"));
    }

    @PostMapping("/{id}/unsuspend")
    @Operation(summary = "Kích hoạt lại công ty")
    public ResponseEntity<?> unsuspendCompany(@PathVariable Long id) {
        Long adminId = 1L;
        adminCompanyService.unsuspendCompany(adminId, id);
        return ResponseEntity.ok(Map.of("message", "Company unsuspended successfully"));
    }
}

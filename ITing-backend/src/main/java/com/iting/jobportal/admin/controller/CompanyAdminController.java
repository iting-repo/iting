package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.*;
import com.iting.jobportal.admin.service.*;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.iting.jobportal.admin.dto.response.CompanyAuditLogResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "10. Admin Company")
@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
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

    @GetMapping("/pending-reviews")
    @Operation(summary = "Lấy danh sách các công ty đang chờ duyệt")
    public ResponseEntity<Page<CompanyResponse>> getPendingReviewCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminCompanyService.getPendingReviewCompanies(page, size));
    }

    /*
    ================================
    CHI TIẾT CÔNG TY & GHI CHÚ
    ================================
    */

    @GetMapping("/{id}/notes")
    @Operation(summary = "Lấy danh sách ghi chú nội bộ của công ty")
    public ResponseEntity<List<com.iting.jobportal.admin.dto.response.KybNoteResponse>> getCompanyKybNotes(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(adminCompanyService.getCompanyKybNotes(id));
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "Thêm ghi chú nội bộ cho công ty")
    public ResponseEntity<com.iting.jobportal.admin.dto.response.KybNoteResponse> addCompanyKybNote(
            @PathVariable Long id,
            @Valid @RequestBody com.iting.jobportal.admin.dto.request.CreateKybNoteRequest request
    ) {
        Long adminId = 1L; // Real app would get from token
        return ResponseEntity.ok(adminCompanyService.addCompanyKybNote(adminId, id, request));
    }

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
    @Operation(summary = "Duyệt toàn bộ công ty (cũ)")
    public ResponseEntity<?> approveCompany(
            @PathVariable Long id,
            @RequestBody CompanyApprovalRequest request) {
        // In a real app, adminId would come from SecurityContext
        Long adminId = 1L; 
        adminCompanyService.approveCompany(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company approved successfully"));
    }

    @PostMapping("/{id}/approve-info")
    @Operation(summary = "Duyệt thông tin cơ bản công ty")
    public ResponseEntity<?> approveCompanyInfo(
            @PathVariable Long id,
            @RequestBody CompanyApprovalRequest request) {
        Long adminId = 1L; 
        adminCompanyService.approveCompanyInfo(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company info approved successfully"));
    }

    @PostMapping("/{id}/approve-documents")
    @Operation(summary = "Duyệt giấy tờ pháp lý công ty")
    public ResponseEntity<?> approveCompanyDocuments(
            @PathVariable Long id,
            @RequestBody CompanyApprovalRequest request) {
        Long adminId = 1L; 
        adminCompanyService.approveCompanyDocuments(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company documents approved successfully"));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Từ chối toàn bộ công ty (cũ)")
    public ResponseEntity<?> rejectCompany(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {
        Long adminId = 1L;
        adminCompanyService.rejectCompany(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company rejected successfully"));
    }

    @PostMapping("/{id}/reject-info")
    @Operation(summary = "Từ chối thông tin cơ bản công ty")
    public ResponseEntity<?> rejectCompanyInfo(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {
        Long adminId = 1L;
        adminCompanyService.rejectCompanyInfo(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company info rejected successfully"));
    }

    @PostMapping("/{id}/reject-documents")
    @Operation(summary = "Từ chối giấy tờ pháp lý công ty")
    public ResponseEntity<?> rejectCompanyDocuments(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {
        Long adminId = 1L;
        adminCompanyService.rejectCompanyDocuments(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "Company documents rejected successfully"));
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

    @GetMapping("/{id}/business-license/view")
    @Operation(summary = "Admin lấy presigned URL để xem giấy phép kinh doanh của công ty")
    public ResponseEntity<Map<String, String>> viewCompanyBusinessLicense(
            @PathVariable Long id
    ) {
        Long adminId = 1L;
        String url = adminCompanyService.getCompanyBusinessLicenseViewUrl(adminId, id, 15);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/{id}/consent-document/view")
    @Operation(summary = "Admin lấy presigned URL để xem văn bản thỏa thuận dữ liệu")
    public ResponseEntity<Map<String, String>> viewCompanyConsentDocument(
            @PathVariable Long id
    ) {
        String url = adminCompanyService.getCompanyConsentDocumentViewUrl(id, 15);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa công ty")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        Long adminId = 1L;
        adminCompanyService.deleteCompany(adminId, id);
        return ResponseEntity.ok(Map.of("message", "Company deleted successfully"));
    }

    /*
    ================================
    BULK ACTIONS
    ================================
    */

    @PostMapping("/bulk-approve")
    @Operation(summary = "Duyệt nhiều công ty")
    public ResponseEntity<?> bulkApproveCompanies(@RequestBody BulkCompanyApprovalRequest request) {
        Long adminId = 1L;
        CompanyApprovalRequest singleReq = new CompanyApprovalRequest();
        singleReq.setVerificationLevel(request.getVerificationLevel());
        singleReq.setNote(request.getNote());
        
        adminCompanyService.bulkApproveCompanies(adminId, request.getIds(), singleReq);
        return ResponseEntity.ok(Map.of("message", "Companies approved successfully"));
    }

    @PostMapping("/bulk-reject")
    @Operation(summary = "Từ chối nhiều công ty")
    public ResponseEntity<?> bulkRejectCompanies(@RequestBody BulkReviewRejectRequest request) {
        Long adminId = 1L;
        ReviewRejectRequest singleReq = new ReviewRejectRequest();
        singleReq.setReason(request.getReason());

        adminCompanyService.bulkRejectCompanies(adminId, request.getIds(), singleReq);
        return ResponseEntity.ok(Map.of("message", "Companies rejected successfully"));
    }

    @PostMapping("/bulk-suspend")
    @Operation(summary = "Đình chỉ nhiều công ty")
    public ResponseEntity<?> bulkSuspendCompanies(@RequestBody BulkReviewRejectRequest request) {
        Long adminId = 1L;
        ReviewRejectRequest singleReq = new ReviewRejectRequest();
        singleReq.setReason(request.getReason());

        adminCompanyService.bulkSuspendCompanies(adminId, request.getIds(), singleReq);
        return ResponseEntity.ok(Map.of("message", "Companies suspended successfully"));
    }

    @PostMapping("/bulk-delete")
    @Operation(summary = "Xóa nhiều công ty")
    public ResponseEntity<?> bulkDeleteCompanies(@RequestBody BulkActionRequest request) {
        Long adminId = 1L;
        adminCompanyService.bulkDeleteCompanies(adminId, request.getIds());
        return ResponseEntity.ok(Map.of("message", "Companies deleted successfully"));
    }
    @GetMapping("/{id}/audit-logs")
    @Operation(summary = "Lấy lịch sử duyệt công ty")
    public ResponseEntity<List<CompanyAuditLogResponse>> getCompanyAuditLogs(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(adminCompanyService.getCompanyAuditLogs(id));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Lấy toàn bộ lịch sử duyệt công ty, có filter")
    public ResponseEntity<List<CompanyAuditLogResponse>> getAllCompanyAuditLogs(
            @RequestParam(required = false) CompanyAuditAction action,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return ResponseEntity.ok(
                adminCompanyService.getAllCompanyAuditLogs(action, companyId, fromDate, toDate)
        );
    }
    @GetMapping("/export")
    @Operation(summary = "Xuất danh sách công ty ra file Excel")
    public ResponseEntity<Resource> exportCompanies() {
        String filename = "companies.xlsx";
        InputStreamResource file = new InputStreamResource(adminCompanyService.exportCompaniesToExcel());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import")
    @Operation(summary = "Nhập danh sách công ty từ file Excel")
    public ResponseEntity<?> importCompanies(@RequestParam("file") MultipartFile file) {
        adminCompanyService.importCompaniesFromExcel(file);
        return ResponseEntity.ok(Map.of("message", "Companies imported successfully"));
    }

    @GetMapping("/template")
    @Operation(summary = "Tải file mẫu Excel để nhập công ty")
    public ResponseEntity<Resource> getTemplate() {
        String filename = "companies_template.xlsx";
        InputStreamResource file = new InputStreamResource(adminCompanyService.getImportTemplate());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
}

package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.entity.*;
import com.iting.jobportal.admin.service.AdminService;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "APIs quản trị hệ thống")
public class AdminController {

    private final AdminService adminService;

    // ========================================
    // DASHBOARD & THỐNG KÊ
    // ========================================

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê tổng quan dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ========================================
    // QUẢN LÝ NGƯỜI DÙNG
    // ========================================

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách người dùng")
    public ResponseEntity<Page<UserListResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Role roleEnum = role != null ? Role.valueOf(role) : null;
        AccountStatus statusEnum = status != null ? AccountStatus.valueOf(status) : null;
        
        return ResponseEntity.ok(adminService.getAllUsers(keyword, roleEnum, statusEnum, page, size));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Xem chi tiết người dùng")
    public ResponseEntity<UserListResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Cập nhật thông tin người dùng (phân quyền, trạng thái)")
    public ResponseEntity<UserListResponse> updateUser(
            @CurrentUser Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(adminId, id, request));
    }

    @PostMapping("/users/{id}/ban")
    @Operation(summary = "Khóa tài khoản người dùng")
    public ResponseEntity<?> banUser(
            @CurrentUser Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody BanUserRequest request) {
        adminService.banUser(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "User banned successfully"));
    }

    @PostMapping("/users/{id}/unban")
    @Operation(summary = "Mở khóa tài khoản người dùng")
    public ResponseEntity<?> unbanUser(
            @CurrentUser Long adminId,
            @PathVariable Long id) {
        adminService.unbanUser(adminId, id);
        return ResponseEntity.ok(Map.of("message", "User unbanned successfully"));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Xóa tài khoản người dùng")
    public ResponseEntity<?> deleteUser(
            @CurrentUser Long adminId,
            @PathVariable Long id) {
        adminService.deleteUser(adminId, id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // ========================================
    // KIỂM DUYỆT TIN TUYỂN DỤNG
    // ========================================

    @GetMapping("/jobs/pending")
    @Operation(summary = "Lấy danh sách tin tuyển dụng chờ duyệt")
    public ResponseEntity<Page<?>> getPendingJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getPendingJobs(page, size));
    }

    @PostMapping("/jobs/{id}/approve")
    @Operation(summary = "Duyệt tin tuyển dụng")
    public ResponseEntity<?> approveJob(
            @CurrentUser Long adminId,
            @PathVariable Long id) {
        adminService.approveJob(adminId, id);
        return ResponseEntity.ok(Map.of("message", "Job approved successfully"));
    }

    @PostMapping("/jobs/{id}/reject")
    @Operation(summary = "Từ chối tin tuyển dụng")
    public ResponseEntity<?> rejectJob(
            @CurrentUser Long adminId,
            @PathVariable Long id,
            @RequestParam String reason) {
        adminService.rejectJob(adminId, id, reason);
        return ResponseEntity.ok(Map.of("message", "Job rejected successfully"));
    }

    // ========================================
    // QUẢN LÝ BÁO CÁO VI PHẠM
    // ========================================

    @GetMapping("/reports")
    @Operation(summary = "Lấy danh sách báo cáo vi phạm")
    public ResponseEntity<Page<UserReport>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getReports(status, page, size));
    }

    @PutMapping("/reports/{id}")
    @Operation(summary = "Xử lý báo cáo vi phạm")
    public ResponseEntity<UserReport> handleReport(
            @CurrentUser Long adminId,
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(adminService.handleReport(adminId, id, status, note));
    }

    // ========================================
    // QUẢN LÝ DANH MỤC
    // ========================================

    @GetMapping("/categories")
    @Operation(summary = "Lấy danh sách danh mục theo loại")
    public ResponseEntity<List<Category>> getCategories(
            @RequestParam String type) {
        return ResponseEntity.ok(adminService.getCategoriesByType(type));
    }

    @PostMapping("/categories")
    @Operation(summary = "Tạo danh mục mới")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(adminService.createCategory(category));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Cập nhật danh mục")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {
        return ResponseEntity.ok(adminService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Xóa danh mục")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }

    // ========================================
    // QUẢN LÝ NỘI DUNG TĨNH
    // ========================================

    @GetMapping("/contents")
    @Operation(summary = "Lấy danh sách nội dung tĩnh")
    public ResponseEntity<Page<StaticContent>> getContents(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getStaticContents(type, page, size));
    }

    @GetMapping("/contents/{slug}")
    @Operation(summary = "Lấy nội dung theo slug")
    public ResponseEntity<StaticContent> getContentBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(adminService.getStaticContentBySlug(slug));
    }

    @PostMapping("/contents")
    @Operation(summary = "Tạo nội dung mới")
    public ResponseEntity<StaticContent> createContent(@RequestBody StaticContent content) {
        return ResponseEntity.ok(adminService.createStaticContent(content));
    }

    @PutMapping("/contents/{id}")
    @Operation(summary = "Cập nhật nội dung")
    public ResponseEntity<StaticContent> updateContent(
            @PathVariable Long id,
            @RequestBody StaticContent content) {
        return ResponseEntity.ok(adminService.updateStaticContent(id, content));
    }

    @DeleteMapping("/contents/{id}")
    @Operation(summary = "Xóa nội dung")
    public ResponseEntity<?> deleteContent(@PathVariable Long id) {
        adminService.deleteStaticContent(id);
        return ResponseEntity.ok(Map.of("message", "Content deleted successfully"));
    }

    @PostMapping("/contents/{id}/publish")
    @Operation(summary = "Xuất bản nội dung")
    public ResponseEntity<?> publishContent(@PathVariable Long id) {
        adminService.publishStaticContent(id);
        return ResponseEntity.ok(Map.of("message", "Content published successfully"));
    }

    @PostMapping("/contents/{id}/unpublish")
    @Operation(summary = "Hủy xuất bản nội dung")
    public ResponseEntity<?> unpublishContent(@PathVariable Long id) {
        adminService.unpublishStaticContent(id);
        return ResponseEntity.ok(Map.of("message", "Content unpublished successfully"));
    }

    // ========================================
    // ACTIVITY LOGS
    // ========================================

    @GetMapping("/activity-logs")
    @Operation(summary = "Xem lịch sử hoạt động")
    public ResponseEntity<Page<ActivityLog>> getActivityLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(adminService.getActivityLogs(userId, action, page, size));
    }
}

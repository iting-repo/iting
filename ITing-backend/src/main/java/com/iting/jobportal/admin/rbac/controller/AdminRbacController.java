package com.iting.jobportal.admin.rbac.controller;

import com.iting.jobportal.admin.rbac.dto.*;
import com.iting.jobportal.admin.rbac.service.RbacService;
import com.iting.jobportal.auth.security.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/rbac")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "16. Admin RBAC", description = "Quản lý vai trò nền tảng / doanh nghiệp & quy trình duyệt")
public class AdminRbacController {

  private final RbacService rbacService;

  private Long actorId(AuthUser user) {
    return user != null ? user.getId() : null;
  }

  @GetMapping("/me/permissions")
  @Operation(summary = "Quyền hiệu lực của user hiện tại (ẩn/hiện menu & nút ở frontend)")
  public ResponseEntity<MePermissionsResponse> myPermissions(
      @AuthenticationPrincipal AuthUser user) {
    return ResponseEntity.ok(rbacService.currentUserPermissions(actorId(user)));
  }

  // ── Catalog ─────────────────────────────────────────────────────────────

  @GetMapping("/permissions")
  @Operation(summary = "Lấy catalog quyền (lọc theo scope PLATFORM|COMPANY)")
  public ResponseEntity<List<PermissionResponse>> permissions(
      @RequestParam(required = false) String scope) {
    return ResponseEntity.ok(rbacService.listPermissions(scope));
  }

  // ── Roles ───────────────────────────────────────────────────────────────

  @GetMapping("/roles")
  @Operation(summary = "Danh sách role (lọc theo scope PLATFORM|COMPANY)")
  public ResponseEntity<List<RoleResponse>> roles(@RequestParam(required = false) String scope) {
    return ResponseEntity.ok(rbacService.listRoles(scope));
  }

  @GetMapping("/roles/pending")
  @Operation(summary = "Danh sách role đang chờ duyệt")
  public ResponseEntity<List<RoleResponse>> pending() {
    return ResponseEntity.ok(rbacService.listPendingApprovals());
  }

  @GetMapping("/roles/{id}")
  @Operation(summary = "Chi tiết một role")
  public ResponseEntity<RoleResponse> getRole(@PathVariable Long id) {
    return ResponseEntity.ok(rbacService.getRole(id));
  }

  @PostMapping("/roles")
  @PreAuthorize("@perm.has('platform.roles.manage')")
  @Operation(summary = "Tạo role mới (mặc định DRAFT)")
  public ResponseEntity<RoleResponse> create(
      @AuthenticationPrincipal AuthUser user, @Valid @RequestBody CreateRoleRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(rbacService.createRole(actorId(user), request));
  }

  @PutMapping("/roles/{id}")
  @PreAuthorize("@perm.has('platform.roles.manage')")
  @Operation(summary = "Cập nhật role (metadata và/hoặc quyền)")
  public ResponseEntity<RoleResponse> update(
      @AuthenticationPrincipal AuthUser user,
      @PathVariable Long id,
      @RequestBody UpdateRoleRequest request) {
    return ResponseEntity.ok(rbacService.updateRole(actorId(user), id, request));
  }

  @DeleteMapping("/roles/{id}")
  @PreAuthorize("@perm.has('platform.roles.manage')")
  @Operation(summary = "Xóa role (không áp dụng role hệ thống)")
  public ResponseEntity<Map<String, String>> delete(
      @AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
    rbacService.deleteRole(actorId(user), id);
    return ResponseEntity.ok(Map.of("message", "Đã xóa role"));
  }

  // ── Approval workflow ────────────────────────────────────────────────────

  @PostMapping("/roles/{id}/submit")
  @Operation(summary = "Gửi role đi duyệt (DRAFT → PENDING_APPROVAL)")
  public ResponseEntity<RoleResponse> submit(
      @AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
    return ResponseEntity.ok(rbacService.submitForApproval(actorId(user), id));
  }

  @PostMapping("/roles/{id}/approve")
  @PreAuthorize("@perm.has('platform.roles.approve')")
  @Operation(summary = "Duyệt role (Super Admin) — kích hoạt")
  public ResponseEntity<RoleResponse> approve(
      @AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
    return ResponseEntity.ok(rbacService.approveRole(actorId(user), id));
  }

  @PostMapping("/roles/{id}/reject")
  @PreAuthorize("@perm.has('platform.roles.approve')")
  @Operation(summary = "Từ chối role (Super Admin)")
  public ResponseEntity<RoleResponse> reject(
      @AuthenticationPrincipal AuthUser user,
      @PathVariable Long id,
      @RequestBody(required = false) RejectRoleRequest request) {
    String reason = request != null ? request.getReason() : null;
    return ResponseEntity.ok(rbacService.rejectRole(actorId(user), id, reason));
  }

  @PatchMapping("/roles/{id}/status")
  @Operation(summary = "Bật/tắt role đã duyệt (ACTIVE|DISABLED)")
  public ResponseEntity<RoleResponse> status(
      @AuthenticationPrincipal AuthUser user,
      @PathVariable Long id,
      @RequestBody Map<String, String> body) {
    return ResponseEntity.ok(rbacService.setStatus(actorId(user), id, body.get("status")));
  }

  // ── Assignment ───────────────────────────────────────────────────────────

  @PostMapping("/assign")
  @PreAuthorize("@perm.has('platform.roles.manage')")
  @Operation(summary = "Gán role cho tài khoản (kiểm tra account_type & rule bảo mật)")
  public ResponseEntity<Map<String, String>> assign(
      @AuthenticationPrincipal AuthUser user, @Valid @RequestBody AssignRoleRequest request) {
    rbacService.assignRole(actorId(user), request);
    return ResponseEntity.ok(Map.of("message", "Đã gán role"));
  }

  // ── Company RBAC: HR con trong công ty ────────────────────────────────────

  @GetMapping("/companies")
  @Operation(summary = "Danh sách công ty (cho dropdown phân quyền HR)")
  public ResponseEntity<List<CompanySummaryResponse>> companies(
      @RequestParam(required = false) String keyword) {
    return ResponseEntity.ok(rbacService.listCompanies(keyword));
  }

  @GetMapping("/companies/{companyId}/members")
  @Operation(summary = "Danh sách HR thuộc công ty + company role")
  public ResponseEntity<List<CompanyMemberResponse>> members(@PathVariable Long companyId) {
    return ResponseEntity.ok(rbacService.listCompanyMembers(companyId));
  }

  @GetMapping("/companies/available-hr")
  @Operation(summary = "HR chưa thuộc công ty nào (để thêm vào công ty)")
  public ResponseEntity<List<AvailableHrResponse>> availableHr(
      @RequestParam(required = false) String keyword) {
    return ResponseEntity.ok(rbacService.listAvailableHr(keyword));
  }

  @PostMapping("/companies/{companyId}/members")
  @Operation(summary = "Thêm HR vào công ty kèm company role")
  public ResponseEntity<CompanyMemberResponse> addMember(
      @AuthenticationPrincipal AuthUser user,
      @PathVariable Long companyId,
      @Valid @RequestBody AddCompanyMemberRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(rbacService.addCompanyMember(actorId(user), companyId, request));
  }

  @PutMapping("/members/{affiliationId}/role")
  @Operation(summary = "Gán / đổi company role cho một thành viên")
  public ResponseEntity<CompanyMemberResponse> assignMemberRole(
      @AuthenticationPrincipal AuthUser user,
      @PathVariable Long affiliationId,
      @Valid @RequestBody AssignCompanyRoleRequest request) {
    return ResponseEntity.ok(
        rbacService.assignCompanyRole(actorId(user), affiliationId, request.getRoleCode()));
  }

  @DeleteMapping("/members/{affiliationId}")
  @Operation(summary = "Gỡ HR khỏi công ty")
  public ResponseEntity<Map<String, String>> removeMember(
      @AuthenticationPrincipal AuthUser user, @PathVariable Long affiliationId) {
    rbacService.removeCompanyMember(actorId(user), affiliationId);
    return ResponseEntity.ok(Map.of("message", "Đã gỡ thành viên"));
  }

  // ── Tài khoản nội bộ (gán platform role) ──────────────────────────────────

  @GetMapping("/staff")
  @Operation(summary = "Danh sách tài khoản để gán quyền (rỗng → chỉ nhân sự nội bộ)")
  public ResponseEntity<List<StaffResponse>> staff(@RequestParam(required = false) String keyword) {
    return ResponseEntity.ok(rbacService.listStaff(keyword));
  }

  @PostMapping("/staff")
  @PreAuthorize("@perm.has('platform.roles.manage')")
  @Operation(summary = "Tạo tài khoản nội bộ ITing mới (đăng nhập được)")
  public ResponseEntity<StaffResponse> createStaff(
      @AuthenticationPrincipal AuthUser user,
      @Valid @RequestBody CreateInternalAccountRequest request) {
    return ResponseEntity.ok(rbacService.createInternalAccount(actorId(user), request));
  }

  @PostMapping("/staff/{accountId}/promote")
  @PreAuthorize("@perm.has('platform.roles.manage')")
  @Operation(summary = "Nâng tài khoản thành nhân sự nội bộ ITing")
  public ResponseEntity<StaffResponse> promote(
      @AuthenticationPrincipal AuthUser user, @PathVariable Long accountId) {
    return ResponseEntity.ok(rbacService.promoteToStaff(actorId(user), accountId));
  }

  @DeleteMapping("/staff/{accountId}/role")
  @PreAuthorize("@perm.has('platform.roles.manage')")
  @Operation(summary = "Thu hồi platform role của tài khoản")
  public ResponseEntity<Map<String, String>> clearRole(
      @AuthenticationPrincipal AuthUser user, @PathVariable Long accountId) {
    rbacService.clearPlatformRole(actorId(user), accountId);
    return ResponseEntity.ok(Map.of("message", "Đã thu hồi quyền"));
  }
}

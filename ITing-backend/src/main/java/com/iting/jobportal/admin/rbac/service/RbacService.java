package com.iting.jobportal.admin.rbac.service;

import com.iting.jobportal.admin.rbac.dto.*;
import java.util.List;

/** Quản lý RBAC: catalog quyền, vai trò (platform/company), vòng đời duyệt và gán role. */
public interface RbacService {

  List<PermissionResponse> listPermissions(String scope);

  List<RoleResponse> listRoles(String scope);

  List<RoleResponse> listPendingApprovals();

  RoleResponse getRole(Long id);

  RoleResponse createRole(Long actorId, CreateRoleRequest request);

  RoleResponse updateRole(Long actorId, Long id, UpdateRoleRequest request);

  /** DRAFT → PENDING_APPROVAL. */
  RoleResponse submitForApproval(Long actorId, Long id);

  /** PENDING_APPROVAL → ACTIVE. Chỉ Super Admin. */
  RoleResponse approveRole(Long actorId, Long id);

  /** PENDING_APPROVAL → REJECTED. Chỉ Super Admin. */
  RoleResponse rejectRole(Long actorId, Long id, String reason);

  /** Bật/tắt role đã duyệt: ACTIVE ⇄ DISABLED. */
  RoleResponse setStatus(Long actorId, Long id, String status);

  void deleteRole(Long actorId, Long id);

  /** Gán role cho tài khoản (kiểm tra account_type & các rule bảo mật). */
  void assignRole(Long actorId, AssignRoleRequest request);

  // ── Company RBAC: gán HR con vào công ty + company role ────────────────────

  List<CompanySummaryResponse> listCompanies(String keyword);

  List<CompanyMemberResponse> listCompanyMembers(Long companyId);

  /** HR (EMPLOYER) chưa thuộc công ty nào — để chọn thêm vào công ty. */
  List<AvailableHrResponse> listAvailableHr(String keyword);

  /** Thêm một HR vào công ty kèm company role. */
  CompanyMemberResponse addCompanyMember(Long actorId, Long companyId, AddCompanyMemberRequest req);

  /** Gán / đổi company role cho một thành viên hiện có. */
  CompanyMemberResponse assignCompanyRole(Long actorId, Long affiliationId, String roleCode);

  /** Gỡ HR khỏi công ty (thu hồi affiliation). */
  void removeCompanyMember(Long actorId, Long affiliationId);

  // ── Tài khoản nội bộ (gán platform role) ──────────────────────────────────

  /** Danh sách tài khoản để gán quyền. keyword rỗng → chỉ INTERNAL_STAFF; có keyword → tìm mọi tài khoản. */
  List<StaffResponse> listStaff(String keyword);

  /** Nâng một tài khoản công khai/HR thành nhân sự nội bộ ITing. */
  StaffResponse promoteToStaff(Long actorId, Long accountId);

  /** Thu hồi platform role đang gán (xóa adminRole). */
  void clearPlatformRole(Long actorId, Long accountId);
}

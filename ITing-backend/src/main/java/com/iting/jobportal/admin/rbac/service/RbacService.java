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
}

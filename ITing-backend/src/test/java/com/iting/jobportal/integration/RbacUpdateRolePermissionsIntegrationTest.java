package com.iting.jobportal.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.iting.jobportal.admin.rbac.dto.RoleResponse;
import com.iting.jobportal.admin.rbac.dto.UpdateRoleRequest;
import com.iting.jobportal.admin.rbac.entity.Permission;
import com.iting.jobportal.admin.rbac.entity.RbacRole;
import com.iting.jobportal.admin.rbac.enums.PermissionScope;
import com.iting.jobportal.admin.rbac.enums.RiskLevel;
import com.iting.jobportal.admin.rbac.enums.RoleStatus;
import com.iting.jobportal.admin.rbac.repository.PermissionRepository;
import com.iting.jobportal.admin.rbac.repository.RbacRolePermissionRepository;
import com.iting.jobportal.admin.rbac.repository.RbacRoleRepository;
import com.iting.jobportal.admin.rbac.service.RbacService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Regression cho lỗi "Lưu thất bại" khi Admin sửa quyền của một role đang có quyền trùng với tập
 * mới. {@code replacePermissions} xoá rồi chèn lại quyền trong cùng transaction; nếu xoá bằng derived
 * delete thường, Hibernate sắp INSERT trước DELETE → vi phạm UNIQUE(role_id, permission_code). Bulk
 * {@code @Modifying} delete (flushAutomatically) đảm bảo DELETE chạy trước INSERT.
 */
class RbacUpdateRolePermissionsIntegrationTest extends AbstractIntegrationTest {

  @Autowired private RbacService rbacService;
  @Autowired private RbacRoleRepository roleRepository;
  @Autowired private PermissionRepository permissionRepository;
  @Autowired private RbacRolePermissionRepository rolePermissionRepository;

  private Long roleId;

  @BeforeEach
  void seed() {
    rolePermissionRepository.deleteAll();
    roleRepository.deleteAll();
    permissionRepository.deleteAll();

    permissionRepository.save(perm("company.profile.view", "Xem hồ sơ công ty"));
    permissionRepository.save(perm("company.applications.update_status", "Cập nhật trạng thái"));
    permissionRepository.save(perm("company.jobs.view_applicants", "Xem ứng viên"));

    RbacRole role =
        RbacRole.builder()
            .code("DEMO_RECRUIT_ASSISTANT")
            .name("Trợ lý tuyển dụng")
            .scope(PermissionScope.COMPANY)
            .status(RoleStatus.PENDING_APPROVAL)
            .systemRole(false)
            .build();
    role = roleRepository.save(role);
    roleId = role.getId();

    // Tập quyền hiện tại: 2 quyền (sẽ trùng với tập mới khi cập nhật).
    rolePermissionRepository.saveAll(
        List.of(
            com.iting.jobportal.admin.rbac.entity.RbacRolePermission.builder()
                .roleId(roleId)
                .permissionCode("company.profile.view")
                .build(),
            com.iting.jobportal.admin.rbac.entity.RbacRolePermission.builder()
                .roleId(roleId)
                .permissionCode("company.applications.update_status")
                .build()));
  }

  private Permission perm(String code, String name) {
    return Permission.builder()
        .code(code)
        .name(name)
        .module("COMPANY")
        .scope(PermissionScope.COMPANY)
        .riskLevel(RiskLevel.LOW)
        .build();
  }

  @Test
  void updateRole_withOverlappingPermissions_succeedsWithoutUniqueViolation() {
    // Tập mới GIỮ LẠI company.profile.view (trùng) + THÊM company.jobs.view_applicants.
    UpdateRoleRequest req = new UpdateRoleRequest();
    req.setPermissions(
        List.of("company.profile.view", "company.jobs.view_applicants"));

    assertThatCode(() -> rbacService.updateRole(1L, roleId, req)).doesNotThrowAnyException();

    List<String> after =
        rolePermissionRepository.findByRoleId(roleId).stream()
            .map(com.iting.jobportal.admin.rbac.entity.RbacRolePermission::getPermissionCode)
            .sorted()
            .toList();
    assertThat(after)
        .containsExactly("company.jobs.view_applicants", "company.profile.view");
  }

  @Test
  void updateRole_replacingWithIdenticalSet_succeeds() {
    // Lưu lại y hệt tập cũ — mọi mã đều trùng, kịch bản dễ vỡ nhất với ordering INSERT-trước-DELETE.
    UpdateRoleRequest req = new UpdateRoleRequest();
    req.setPermissions(List.of("company.profile.view", "company.applications.update_status"));

    RoleResponse resp = rbacService.updateRole(1L, roleId, req);

    assertThat(resp.getPermissions())
        .containsExactlyInAnyOrder("company.profile.view", "company.applications.update_status");
  }
}

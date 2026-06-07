package com.iting.jobportal.admin.rbac.enums;

/**
 * Vòng đời của một vai trò.
 *
 * <pre>
 *   DRAFT ──submit──▶ PENDING_APPROVAL ──approve──▶ APPROVED ──activate──▶ ACTIVE ⇄ DISABLED
 *                                       └──reject──▶ REJECTED
 * </pre>
 *
 * Role chỉ được gán cho tài khoản khi đang ở trạng thái {@link #ACTIVE}.
 */
public enum RoleStatus {
  DRAFT,
  PENDING_APPROVAL,
  APPROVED,
  REJECTED,
  ACTIVE,
  DISABLED
}

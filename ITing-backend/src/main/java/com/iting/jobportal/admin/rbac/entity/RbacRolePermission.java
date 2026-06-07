package com.iting.jobportal.admin.rbac.entity;

import jakarta.persistence.*;
import lombok.*;

/** Liên kết role ↔ permission theo {@code permissionCode} (khớp với {@link Permission#getCode()}). */
@Entity
@Table(
    name = "rbac_role_permission",
    uniqueConstraints = @UniqueConstraint(columnNames = {"role_id", "permission_code"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RbacRolePermission {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "role_id", nullable = false)
  private Long roleId;

  @Column(name = "permission_code", nullable = false, length = 100)
  private String permissionCode;
}

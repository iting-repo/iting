package com.iting.jobportal.admin.rbac.entity;

import com.iting.jobportal.admin.rbac.enums.PermissionScope;
import com.iting.jobportal.admin.rbac.enums.RiskLevel;
import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Một quyền trong catalog. Định danh bằng {@code code} (vd: {@code platform.users.delete}). */
@Entity
@Table(name = "rbac_permission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class Permission extends AuditEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 100)
  private String code;

  @Column(nullable = false, length = 150)
  private String name;

  @Column(nullable = false, length = 50)
  private String module;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PermissionScope scope;

  @Enumerated(EnumType.STRING)
  @Column(name = "risk_level", nullable = false, length = 20)
  private RiskLevel riskLevel;

  @Column(length = 300)
  private String description;
}

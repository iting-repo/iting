package com.iting.jobportal.admin.rbac.entity;

import com.iting.jobportal.admin.rbac.enums.PermissionScope;
import com.iting.jobportal.admin.rbac.enums.RoleStatus;
import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Vai trò (platform hoặc company) với vòng đời duyệt. Vai trò hệ thống ({@code systemRole = true})
 * không thể bị xóa và luôn ở trạng thái ACTIVE.
 */
@Entity
@Table(name = "rbac_role")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class RbacRole extends AuditEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 60)
  private String code;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(length = 300)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PermissionScope scope;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  @Builder.Default
  private RoleStatus status = RoleStatus.DRAFT;

  @Column(name = "system_role", nullable = false)
  @Builder.Default
  private Boolean systemRole = false;

  @Column(length = 500)
  private String reason;

  @Column(name = "reject_reason", length = 500)
  private String rejectReason;

  @Column(name = "created_by")
  private Long createdBy;

  @Column(name = "approved_by")
  private Long approvedBy;

  @Column(name = "approved_at")
  private LocalDateTime approvedAt;
}

package com.iting.jobportal.admin.rbac.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/** Gán / đổi company role cho một thành viên (affiliation) hiện có. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignCompanyRoleRequest {
  @NotNull(message = "roleCode không được để trống")
  private String roleCode;
}

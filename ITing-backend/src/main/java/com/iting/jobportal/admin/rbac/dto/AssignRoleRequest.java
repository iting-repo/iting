package com.iting.jobportal.admin.rbac.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/** Gán một platform role (theo code) cho tài khoản nội bộ ITing. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignRoleRequest {
  @NotNull(message = "accountId không được để trống")
  private Long accountId;

  @NotNull(message = "roleCode không được để trống")
  private String roleCode;
}

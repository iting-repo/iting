package com.iting.jobportal.admin.rbac.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/** Thêm một HR vào công ty kèm company role. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddCompanyMemberRequest {
  @NotNull(message = "accountId không được để trống")
  private Long accountId;

  @NotNull(message = "roleCode không được để trống")
  private String roleCode;
}

package com.iting.jobportal.admin.rbac.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectRoleRequest {
  private String reason;
}

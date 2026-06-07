package com.iting.jobportal.admin.rbac.dto;

import com.iting.jobportal.admin.rbac.entity.Permission;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {
  private Long id;
  private String code;
  private String name;
  private String module;
  private String scope;
  private String riskLevel;
  private String description;

  public static PermissionResponse from(Permission p) {
    return PermissionResponse.builder()
        .id(p.getId())
        .code(p.getCode())
        .name(p.getName())
        .module(p.getModule())
        .scope(p.getScope().name())
        .riskLevel(p.getRiskLevel().name())
        .description(p.getDescription())
        .build();
  }
}

package com.iting.jobportal.admin.rbac.dto;

import java.util.List;
import lombok.*;

/** Quyền hiệu lực của user hiện tại — frontend dùng để ẩn/hiện menu & nút. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MePermissionsResponse {
  private Long accountId;
  private String email;
  private String accountType;
  private String platformRole;
  private String platformRoleName;
  private boolean superAdmin;
  private List<String> permissions;
}

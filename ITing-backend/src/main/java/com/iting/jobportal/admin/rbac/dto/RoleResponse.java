package com.iting.jobportal.admin.rbac.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {
  private Long id;
  private String code;
  private String name;
  private String description;
  private String scope;
  private String status;
  private Boolean systemRole;
  private String reason;
  private String rejectReason;

  private Long createdBy;
  private String createdByName;
  private Long approvedBy;
  private String approvedByName;
  private LocalDateTime approvedAt;
  private LocalDateTime createdAt;

  private List<String> permissions;
  private Integer permissionCount;
  private String highestRisk; // LOW | MEDIUM | HIGH — mức rủi ro cao nhất trong tập quyền
}

package com.iting.jobportal.admin.rbac.dto;

import lombok.*;

/** HR (role EMPLOYER) chưa thuộc công ty nào — ứng viên để thêm vào công ty. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableHrResponse {
  private Long accountId;
  private String email;
  private String fullName;
}

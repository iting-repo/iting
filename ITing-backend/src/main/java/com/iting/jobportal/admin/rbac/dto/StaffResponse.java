package com.iting.jobportal.admin.rbac.dto;

import lombok.*;

/** Một tài khoản + vai trò nền tảng đang gán (cho màn "Tài khoản nội bộ"). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
  private Long accountId;
  private String email;
  private String fullName;
  private String accountType; // PUBLIC | COMPANY_STAFF | INTERNAL_STAFF
  private String status;
  private String roleBasic; // role thô (CANDIDATE/EMPLOYER/ADMIN)
  private String platformRoleCode; // adminRole — mã platform role đang gán
  private String platformRoleName;
}

package com.iting.jobportal.admin.rbac.dto;

import lombok.*;

/** Một HR thuộc công ty + company role đang gán. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyMemberResponse {
  private Long affiliationId;
  private Long accountId;
  private String email;
  private String fullName;
  private String status; // AffiliationStatus
  private String companyRoleCode;
  private String companyRoleName;
}

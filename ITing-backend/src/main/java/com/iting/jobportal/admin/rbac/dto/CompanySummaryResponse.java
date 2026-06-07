package com.iting.jobportal.admin.rbac.dto;

import lombok.*;

/** Tóm tắt công ty cho dropdown chọn công ty. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySummaryResponse {
  private Long id;
  private String name;
  private Integer memberCount;
}

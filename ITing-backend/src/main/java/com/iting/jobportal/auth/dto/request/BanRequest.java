package com.iting.jobportal.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BanRequest {
  private String reason;
  private Integer durationDays; // NULL nếu ban vĩnh viễn
}

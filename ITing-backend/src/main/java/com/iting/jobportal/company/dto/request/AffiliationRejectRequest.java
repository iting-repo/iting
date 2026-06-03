package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AffiliationRejectRequest {

  @NotBlank(message = "Lý do reject không được để trống")
  private String reason;
}

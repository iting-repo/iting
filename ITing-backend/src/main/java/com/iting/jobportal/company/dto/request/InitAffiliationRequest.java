package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InitAffiliationRequest {

  @NotBlank(message = "Mã số thuế không được để trống")
  @Size(max = 50, message = "Mã số thuế không được vượt quá 50 ký tự")
  private String taxCode;
}

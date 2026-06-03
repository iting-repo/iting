package com.iting.jobportal.auth.dto.request;

import com.iting.jobportal.common.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
  @NotBlank private String email;

  @NotBlank private String otpCode;

  @NotBlank @StrongPassword private String newPassword;
}

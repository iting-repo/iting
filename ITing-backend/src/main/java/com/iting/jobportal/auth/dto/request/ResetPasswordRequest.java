package com.iting.jobportal.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String otpCode;

    @NotBlank
    private String newPassword;
}

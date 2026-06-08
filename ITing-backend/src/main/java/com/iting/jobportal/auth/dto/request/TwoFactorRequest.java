package com.iting.jobportal.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Bước 2 của đăng nhập 2FA: xác minh mã TOTP (và kích hoạt lần đầu nếu setup). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TwoFactorRequest {

  @Email(message = "Email is invalid")
  @NotBlank(message = "Email is required")
  private String email;

  @NotBlank(message = "Password is required")
  private String password;

  @NotBlank(message = "Mã xác thực không được để trống")
  private String code;

  private String deviceInfo;
  private String ipAddress;
}

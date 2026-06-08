package com.iting.jobportal.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

  private Long userId;
  private String email;
  private String role;
  private String accessToken; // JWT access token
  private String refreshToken; // Refresh token
  private String tokenType; // "Bearer"
  private Long expiresIn; // Access token expiry in seconds

  // ── 2FA (TOTP) ──────────────────────────────────────────────────────
  // Khi tài khoản nội bộ cần xác thực 2 bước: accessToken/refreshToken = null,
  // twoFactorRequired = true. Nếu twoFactorSetup = true → cần thiết lập lần đầu
  // (frontend hiển thị secret + otpauthUrl để quét/nhập vào Google Authenticator).
  @lombok.Builder.Default private boolean twoFactorRequired = false;
  @lombok.Builder.Default private boolean twoFactorSetup = false;
  private String twoFactorSecret; // chỉ trả khi thiết lập lần đầu
  private String otpauthUrl; // chỉ trả khi thiết lập lần đầu
}

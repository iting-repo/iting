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
}

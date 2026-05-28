package com.iting.jobportal.auth.controller;

import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.ForgotPasswordRequest;
import com.iting.jobportal.auth.dto.request.GoogleLoginRequest;
import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.dto.request.ResetPasswordRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.service.AuthService;
import com.iting.jobportal.auth.service.PasswordResetService;
import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RateLimited;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "01. Auth")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

  private final AuthService authService;
  private final PasswordResetService passwordResetService;

  @PostMapping("/register")
  @RateLimited(policy = RateLimitPolicy.REGISTER)
  public Account register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/verify-otp")
  @RateLimited(policy = RateLimitPolicy.OTP)
  public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
    try {
      String email = request.get("email");
      String code = request.get("code");
      log.info("Verifying OTP for email: {}", email);
      authService.verifyOtp(email, code);
      return ResponseEntity.ok(
          Map.of("message", "Xác thực tài khoản thành công! Vui lòng đăng nhập."));
    } catch (Exception e) {
      log.error("OTP Verification failed: {}", e.getMessage(), e);
      throw e;
    }
  }

  @PostMapping("/resend-otp")
  @RateLimited(policy = RateLimitPolicy.OTP)
  public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
    authService.resendOtp(request.get("email"));
    return ResponseEntity.ok(Map.of("message", "Mã OTP mới đã được gửi"));
  }

  @PostMapping("/login")
  @RateLimited(policy = RateLimitPolicy.LOGIN)
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/google")
  @RateLimited(policy = RateLimitPolicy.LOGIN)
  public LoginResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
    return authService.loginWithGoogle(request.getTokenId());
  }

  @PostMapping("/change-password")
  public void changePassword(
      @CurrentUser Long accountId, @Valid @RequestBody ChangePasswordRequest request) {
    authService.changePassword(accountId, request);
  }

  @PostMapping("/forgot-password")
  @RateLimited(policy = RateLimitPolicy.OTP)
  public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    passwordResetService.createPasswordResetToken(request.getEmail());
    return ResponseEntity.ok(
        Map.of("message", "Nếu có tài khoản, một email đặt lại mật khẩu đã được gửi"));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    passwordResetService.resetPassword(
        request.getEmail(), request.getOtpCode(), request.getNewPassword());
    return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được đặt lại thành công"));
  }

  @GetMapping("/me")
  public ResponseEntity<?> getMe(@CurrentUser Long accountId) {
    return ResponseEntity.ok(authService.getMeResponse(accountId));
  }
}

package com.iting.jobportal.auth.controller;

import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.service.AuthService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.dto.request.GoogleLoginRequest;
import com.iting.jobportal.auth.dto.request.ForgotPasswordRequest;
import com.iting.jobportal.auth.dto.request.ResetPasswordRequest;
import com.iting.jobportal.auth.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Tag(name ="01. Auth")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public Account register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public LoginResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.loginWithGoogle(request.getTokenId());
    }

    @PostMapping("/change-password")
    public void changePassword(
            @CurrentUser Long accountId,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(accountId, request);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.createPasswordResetToken(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Nếu có tài khoản, một email đặt lại mật khẩu đã được gửi"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được đặt lại"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@CurrentUser Long accountId) {
        return ResponseEntity.ok(authService.getMeResponse(accountId));
    }
}
    
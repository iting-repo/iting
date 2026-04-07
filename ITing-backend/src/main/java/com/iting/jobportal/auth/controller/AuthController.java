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

@Tag(name ="01. Auth")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
    
}
    
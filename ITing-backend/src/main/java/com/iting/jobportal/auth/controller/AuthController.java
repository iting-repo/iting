package com.iting.jobportal.auth.controller;

import ch.qos.logback.classic.encoder.JsonEncoder;
import com.iting.jobportal.auth.dto.LoginRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.service.AuthService;
import com.iting.jobportal.job.controller.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.iting.jobportal.auth.dto.LoginResponse;
import com.iting.jobportal.auth.dto.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.RegisterRequest;

import java.time.LocalDateTime;

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

    @PostMapping("/change-password")
    public void changePassword(
            @CurrentUser Long accountId,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(accountId, request);
    }
    
}
    
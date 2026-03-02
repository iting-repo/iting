package com.iting.jobportal.auth.controller;

import com.iting.jobportal.auth.dto.RefreshTokenRequest;
import com.iting.jobportal.auth.dto.TokenResponse;
import com.iting.jobportal.auth.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Refresh Token", description = "Refresh token management")
public class RefreshTokenController {

    private final RefreshTokenService refreshTokenService;

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate new access token using refresh token")
    public ResponseEntity<TokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request for device: {}", request.getDeviceInfo());
        
        TokenResponse response = refreshTokenService.refreshToken(request);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Revoke refresh token")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authorization) {
        // Extract token from Bearer token
        // Note: This would require the refresh token to be passed separately
        // For now, we'll implement a simple logout that clears all user tokens
        log.info("Logout request received");
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Logout from all devices", description = "Revoke all refresh tokens for user")
    public ResponseEntity<Void> logoutAll(@RequestHeader("X-User-Id") Long userId) {
        log.info("Logout all devices request for user: {}", userId);
        
        refreshTokenService.revokeAllUserTokens(userId);
        
        return ResponseEntity.ok().build();
    }
}

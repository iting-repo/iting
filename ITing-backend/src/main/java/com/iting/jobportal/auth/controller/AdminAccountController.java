package com.iting.jobportal.auth.controller;

import com.iting.jobportal.auth.dto.request.BanRequest;
import com.iting.jobportal.auth.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/accounts")
@RequiredArgsConstructor
public class AdminAccountController {

    private final AccountService accountService;

    // 1. API Cấm tài khoản (Ban)
    @PostMapping("/{id}/ban")
    @Operation(summary = "Cấm tài khoản (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> banAccount(
            @PathVariable Long id,
            @RequestBody BanRequest request,
            @AuthenticationPrincipal UserDetails adminDetails) {

        // adminDetails lấy từ Spring Security để biết Admin nào đang thực hiện
        accountService.banAccount(id, request, adminDetails.getUsername());

        return ResponseEntity.ok(Map.of("message", "Account has been banned successfully"));
    }

    // 2. API Gỡ cấm (Unban)
    @PostMapping("/{id}/unban")
    @Operation(summary = "Gỡ cấm tài khoản (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unbanAccount(@PathVariable Long id) {

        accountService.unbanAccount(id);

        return ResponseEntity.ok(Map.of("message", "Account has been unbanned successfully"));
    }
}
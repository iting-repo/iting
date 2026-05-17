package com.iting.jobportal.admin.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin-only endpoints to manage account lockouts (brute-force protection).
 *
 * <ul>
 *   <li>GET  /api/admin/locked-accounts          — list currently locked accounts</li>
 *   <li>POST /api/admin/users/{id}/unlock        — manually unlock an account</li>
 * </ul>
 */
@RestController
@RequiredArgsConstructor
public class AdminAccountLockController {

    private final AccountRepository accountRepository;

    @GetMapping("/api/admin/locked-accounts")
    public ResponseEntity<List<Map<String, Object>>> listLocked() {
        List<Account> locked = accountRepository.findByLockedUntilAfter(LocalDateTime.now());
        return ResponseEntity.ok(locked.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @PostMapping("/api/admin/users/{id}/unlock")
    public ResponseEntity<Map<String, String>> unlock(@PathVariable Long id) {
        Account acc = accountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));
        acc.setLockedUntil(null);
        acc.setFailedLoginAttempts(0);
        accountRepository.save(acc);
        return ResponseEntity.ok(Map.of("message", "Đã unlock account #" + id));
    }

    private Map<String, Object> toDto(Account acc) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", acc.getId());
        m.put("email", acc.getEmail());
        m.put("fullName", acc.getFullName());
        m.put("role", acc.getRole() != null ? acc.getRole().name() : null);
        m.put("failedLoginAttempts", acc.getFailedLoginAttempts());
        m.put("lockedUntil", acc.getLockedUntil());
        m.put("lastLoginAt", acc.getLastLoginAt());
        return m;
    }
}

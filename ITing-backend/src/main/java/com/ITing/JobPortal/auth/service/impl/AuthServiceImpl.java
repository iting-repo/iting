package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.dto.LoginRequest;
import com.iting.jobportal.auth.dto.LoginResponse;
import com.iting.jobportal.auth.dto.ChangePasswordRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.service.AuthService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;   // ✅ THÊM DÒNG NÀY

    @Override
    public LoginResponse login(LoginRequest request) {

        Account account = accountRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 🔥 Tạo JWT Token
        String token = jwtTokenUtil.generateToken(
                account.getId(),
                account.getEmail(),
                account.getRole().name()
        );

        return new LoginResponse(
                account.getId(),
                account.getEmail(),
                account.getRole().name(),
                token
        );
    }

    @Override
    public void changePassword(Long accountId, ChangePasswordRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Wrong old password");
        }

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    @Override
    public Account getAccountByEmail(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }
}

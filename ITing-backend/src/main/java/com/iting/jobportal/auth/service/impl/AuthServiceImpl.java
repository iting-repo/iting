package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.service.AuthService;
import com.iting.jobportal.auth.service.RefreshTokenService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final RefreshTokenService refreshTokenService;
    private final CompanyRepository companyRepository;

    @Override
    @Transactional
    public Account register(RegisterRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Account account = Account.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(com.iting.jobportal.auth.entity.Enum.AccountStatus.ACTIVE)
                .build();

        account = accountRepository.save(account);

        if (request.getRole() == Role.CANDIDATE) {
            User user = new User();
            user.setAccount(account); // QUAN TRỌNG
            user.setFullName(request.getFullName());
            user.setLastUpdate(LocalDateTime.now());
            userRepository.save(user);
        }

        if (request.getRole() == Role.COMPANY) {
            Company company = new Company();
            company.setAccount(account);
            company.setName(request.getFullName());
            companyRepository.save(company);
        }

        return account;
    }

    @Transactional
    @Override
    public LoginResponse login(LoginRequest request) {

        Account account = accountRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Sai mật khẩu hoặc tài khoản"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Sai mật khẩu hoặc tài khoản");
        }

        if (account.getStatus() == com.iting.jobportal.auth.entity.Enum.AccountStatus.BANNED) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng kiểm tra email để biết thêm chi tiết.");
        }

        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        String primaryRole = account.getRole() != null
                ? account.getRole().normalizedName()
                : "CANDIDATE";

        // 🔥 Tạo JWT Access Token
        String accessToken = jwtTokenUtil.generateToken(
                account.getId(),
                account.getEmail(),
                primaryRole);

        // 🔥 Tạo Refresh Token
        var refreshToken = refreshTokenService.createRefreshToken(
                account.getId(),
                account.getEmail(),
                request.getDeviceInfo() != null ? request.getDeviceInfo() : "Unknown",
                request.getIpAddress() != null ? request.getIpAddress() : "Unknown"
        );

        return LoginResponse.builder()
                .userId(account.getId())
                .email(account.getEmail())
                .role(primaryRole)
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(86400L) // 24 hours in seconds
                .build();
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

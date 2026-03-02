package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.auth.dto.LoginRequest;
import com.iting.jobportal.auth.dto.LoginResponse;
import com.iting.jobportal.auth.dto.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.RegisterRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.service.AuthService;
import com.iting.jobportal.auth.service.RefreshTokenService;
import com.iting.jobportal.core.repository.auth.RoleRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final RefreshTokenService refreshTokenService;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public Account register(RegisterRequest request) {
        // 1. Kiểm tra email trùng
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // 2. Tạo Account
        Account account = Account.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(AccountStatus.ACTIVE)
                .build();

        // 3. Gán role cho account (RBAC)
        com.iting.jobportal.core.domain.auth.Role rbacRole = roleRepository.findByName(request.getRole().name())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole().name()));
        account.setRoles(Set.of(rbacRole));

        // Lưu Account trước để có ID
        Account savedAccount = accountRepository.save(account);

        // 4. Tạo Profile tương ứng
        String roleName = rbacRole.getName();

        switch (roleName) {
            case "CANDIDATE" -> {
                User user = new User();
                user.setAccount(savedAccount);
                userRepository.save(user);
            }
            case "EMPLOYER" -> {
                Company company = new Company();
                company.setAccount(savedAccount);
                company.setName("New Company");
                companyRepository.save(company);
            }
        }


        return savedAccount;
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Account account = accountRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Lấy role đầu tiên của user (cho backward compatibility)
        String primaryRole = account.getRoles().stream()
                .map(r -> r.getName())
                .sorted() // tạm thời
                .findFirst()
                .orElse("USER");

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

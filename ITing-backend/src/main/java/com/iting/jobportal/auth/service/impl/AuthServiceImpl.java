package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.service.AuthService;
import com.iting.jobportal.auth.service.GoogleAuthService;
import com.iting.jobportal.auth.service.RefreshTokenService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
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
    private final GoogleAuthService googleAuthService;

    @Override
    @Transactional
    public LoginResponse loginWithGoogle(String accessToken) {
        try {
            var payload = googleAuthService.getUserInfo(accessToken);
            String email = (String) payload.get("email");
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            if (email == null) {
                throw new RuntimeException("Could not retrieve email from Google");
            }

            Account account = accountRepository.findByEmail(email).orElseGet(() -> {
                Account newAccount = Account.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode("SOCIAL_LOGIN_" + System.currentTimeMillis()))
                        .role(Role.CANDIDATE)
                        .status(AccountStatus.ACTIVE)
                        .build();
                Account saved = accountRepository.save(newAccount);
                createUserIfNeeded(saved, RegisterRequest.builder().fullName(name).build());
                return saved;
            });

            if (account.getStatus() == AccountStatus.BANNED) {
                throw new RuntimeException("Tài khoản của bạn đã bị khóa.");
            }

            account.setLastLoginAt(LocalDateTime.now());
            accountRepository.save(account);

            String primaryRole = account.getRole().normalizedName();
            String jwtToken = jwtTokenUtil.generateToken(account.getId(), account.getEmail(), primaryRole);
            
            var refreshToken = refreshTokenService.createRefreshToken(
                    account.getId(), 
                    account.getEmail(), 
                    "Google Social Login", 
                    "Unknown"
            );

            return LoginResponse.builder()
                    .userId(account.getId())
                    .email(account.getEmail())
                    .role(primaryRole)
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken.getToken())
                    .tokenType("Bearer")
                    .expiresIn(86400L)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Xác thực Google thất bại: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Account register(RegisterRequest request) {
        if (request == null) {
            throw new RuntimeException("Register request must not be null");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email must not be blank");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password must not be blank");
        }

        if (request.getRole() == null) {
            throw new RuntimeException("Role must not be null");
        }

        Account existingAccount = accountRepository.findByEmail(request.getEmail().trim()).orElse(null);
        if (existingAccount != null) {
            Role requestedRole = request.getRole().normalize();
            Role existingRoleNormalized = existingAccount.getRole().normalize();
            
            if (existingRoleNormalized != requestedRole) {
                String roleName = existingRoleNormalized == Role.CANDIDATE ? "Ứng viên" : "Nhà tuyển dụng";
                throw new RuntimeException("Email này đã được đăng ký với vai trò " + roleName + ". Vui lòng sử dụng email khác hoặc đăng nhập.");
            }
            throw new RuntimeException("Email này đã được sử dụng. Vui lòng sử dụng email khác.");
        }

        Role normalizedRole = request.getRole().normalize();

        Account account = Account.builder()
                .email(request.getEmail().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(normalizedRole) // luôn lưu role chuẩn
                .status(AccountStatus.ACTIVE)
                .build();

        Account savedAccount = accountRepository.save(account);

        switch (normalizedRole) {
            case CANDIDATE -> createUserIfNeeded(savedAccount, request);
            case EMPLOYER -> createCompanyIfNeeded(savedAccount, request);
            case ADMIN -> {
                // không tạo user/company profile tự động cho admin
            }
            default -> throw new RuntimeException("Unsupported role: " + normalizedRole);
        }

        return savedAccount;
    }

    private void createUserIfNeeded(Account account, RegisterRequest request) {
        boolean userExists = userRepository.existsById(account.getId());
        if (userExists) {
            return;
        }

        User user = new User();
        user.setAccount(account);
        user.setFullName(
                request.getFullName() != null && !request.getFullName().isBlank()
                        ? request.getFullName().trim()
                        : account.getEmail()
        );
        user.setLastUpdate(LocalDateTime.now());

        userRepository.save(user);
    }

    private void createCompanyIfNeeded(Account account, RegisterRequest request) {
        boolean companyExists = companyRepository.existsById(account.getId());
        if (companyExists) {
            return;
        }

        Company company = new Company();

        // quan trọng với shared primary key
        company.setId(account.getId());
        company.setAccount(account);

        String defaultName =
                request.getFullName() != null && !request.getFullName().isBlank()
                        ? request.getFullName().trim()
                        : "Chưa cập nhật";

        company.setName(defaultName);
        company.setAccountEmail(account.getEmail());
        company.setCompanyEmail(account.getEmail());

        company.setVerificationLevel(VerificationLevel.UNVERIFIED);
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.DRAFT);
        company.setActive(true);
        company.setFollowerCount(0L);
        company.setProfileSetup(false);
        company.setLastUpdate(LocalDateTime.now());

        companyRepository.save(company);
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

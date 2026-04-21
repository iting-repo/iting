package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.dto.request.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.dto.response.UserMeResponse;
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
import com.iting.jobportal.auth.repository.OtpCodeRepository;
import com.iting.jobportal.auth.entity.OtpCode;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.common.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final RefreshTokenService refreshTokenService;
    private final CompanyRepository companyRepository;
    private final GoogleAuthService googleAuthService;
    private final OtpCodeRepository otpCodeRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

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

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Account account = accountRepository.findByEmail(normalizedEmail).orElse(null);
        
        if (account != null) {
            boolean isPending = account.getStatus() == AccountStatus.PENDING;
            boolean neverLoggedIn = account.getLastLoginAt() == null;
            
            if (!isPending && !neverLoggedIn) {
                Role requestedRole = request.getRole().normalize();
                Role existingRoleNormalized = account.getRole().normalize();
                
                if (existingRoleNormalized != requestedRole) {
                    String roleName = existingRoleNormalized == Role.CANDIDATE ? "Ứng viên" : "Nhà tuyển dụng";
                    throw new RuntimeException("Email này đã được đăng ký với vai trò " + roleName + ". Vui lòng sử dụng email khác hoặc đăng nhập.");
                }
                throw new RuntimeException("Email này đã được sử dụng. Vui lòng sử dụng email khác.");
            }
            
            // Cập nhật thông tin mới cho tài khoản cũ
            account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            account.setRole(request.getRole().normalize());
            account.setStatus(AccountStatus.PENDING);
        } else {
            // Tạo tài khoản mới
            account = Account.builder()
                    .email(normalizedEmail)
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole().normalize())
                    .status(AccountStatus.PENDING)
                    .build();
        }

        Account savedAccount = accountRepository.save(account);

        // Đảm bảo Profile cũng được tạo/cập nhật
        switch (savedAccount.getRole()) {
            case CANDIDATE -> createUserIfNeeded(savedAccount, request);
            case EMPLOYER -> createCompanyIfNeeded(savedAccount, request);
            default -> {}
        }

        // Gửi OTP mới
        sendVerificationOtp(savedAccount.getEmail());
        return savedAccount;
    }

    private void sendVerificationOtp(String email) {
        String otp = String.format("%06d", (int) (Math.random() * 1000000));
        
        // Save to DB
        otpCodeRepository.deleteByEmail(email);
        OtpCode otpCode = OtpCode.builder()
                .email(email)
                .code(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .isVerification(true)
                .build();
        otpCodeRepository.save(otpCode);

        // Send Email
        String html = emailTemplateService.getOtpTemplate(email, otp, "VERIFY_ACCOUNT");
        emailService.sendHtmlEmail(email, "[ITing] Mã xác thực đăng ký tài khoản", html);
    }

    @Override
    @Transactional
    public void verifyOtp(String email, String code) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        String normalizedCode = code != null ? code.trim() : "";

        OtpCode otpCode = otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(normalizedEmail, true)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã xác thực cho email: " + normalizedEmail));

        if (!otpCode.getCode().equals(normalizedCode)) {
            throw new RuntimeException("Mã xác thực không chính xác");
        }

        if (otpCode.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn");
        }

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);
        
        // Sử dụng normalizedEmail để xóa sạch mã OTP
        otpCodeRepository.deleteByEmail(normalizedEmail);

        log.info("Account verified successfully and activated: {}", normalizedEmail);
    }

    @Override
    public void resendOtp(String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        Account account = accountRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại: " + normalizedEmail));
        
        if (account.getStatus() == AccountStatus.ACTIVE) {
            throw new RuntimeException("Tài khoản đã được kích hoạt");
        }

        sendVerificationOtp(normalizedEmail);
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

        // quan trọng với shared primary key: Hibernate tự lấy ID từ account nhờ @MapsId
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

    @Override
    public UserMeResponse getMeResponse(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        String fullName = account.getEmail();
        String avatarUrl = null;

        Role role = account.getRole().normalize();

        if (role == Role.CANDIDATE) {
            User user = userRepository.findById(accountId).orElse(null);
            if (user != null) {
                fullName = user.getFullName();
                avatarUrl = user.getAvatarUrl();
            }
        } else if (role == Role.EMPLOYER) {
            Company company = companyRepository.findById(accountId).orElse(null);
            if (company != null) {
                fullName = company.getName();
                avatarUrl = company.getLogoUrl();
            }
        }

        return UserMeResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .role(account.getRole().normalizedName())
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .build();
    }
}

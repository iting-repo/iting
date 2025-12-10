package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.auth.dto.LoginRequest;
import com.iting.jobportal.auth.dto.LoginResponse;
import com.iting.jobportal.auth.dto.ChangePasswordRequest;
import com.iting.jobportal.auth.dto.RegisterRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.service.AuthService;
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
    private final UserRepository userRepository; // Mới thêm
    private final CompanyRepository companyRepository; // Mới thêm
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @Override
    @Transactional // Quan trọng: Đảm bảo lưu cả 2 bảng hoặc rollback
    public Account register(RegisterRequest request) {
        // 1. Kiểm tra email trùng
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // 2. Tạo Account
        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setRole(request.getRole());
        account.setStatus(AccountStatus.ACTIVE);
        account.setCreatedAt(LocalDateTime.now());

        // Lưu Account trước để có ID (thực ra Hibernate sẽ xử lý việc này trong
        // transaction)
        Account savedAccount = accountRepository.save(account);

        // 3. Tạo Profile tương ứng
        if (request.getRole() == Role.CANDIDATE) { // Hoặc Role.USER tùy enum của bạn
            User user = new User();
            user.setAccount(savedAccount); // Gắn account vào user
            // Set các giá trị mặc định nếu cần
            userRepository.save(user);

        } else if (request.getRole() == Role.EMPLOYER) { // Hoặc Role.COMPANY
            Company company = new Company();
            company.setAccount(savedAccount);
            company.setName("New Company");
            companyRepository.save(company);
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

        // 🔥 Tạo JWT Token
        String token = jwtTokenUtil.generateToken(
                account.getId(),
                account.getEmail(),
                account.getRole().name());

        return new LoginResponse(
                account.getId(),
                account.getEmail(),
                account.getRole().name(),
                token);
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

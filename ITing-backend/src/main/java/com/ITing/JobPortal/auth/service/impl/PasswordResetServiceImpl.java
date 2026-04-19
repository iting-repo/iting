package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.entity.PasswordResetToken;
import com.iting.jobportal.auth.repository.PasswordResetTokenRepository;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.service.PasswordResetService;
import com.iting.jobportal.common.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final AccountRepository accountRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void createPasswordResetToken(String email) {
        accountRepository.findByEmail(email).ifPresent(account -> {
            try {
                String token = UUID.randomUUID().toString();

                PasswordResetToken prt = PasswordResetToken.builder()
                        .token(token)
                        .account(account)
                        .expiresAt(LocalDateTime.now().plusHours(1))
                        .used(false)
                        .build();

                tokenRepository.save(prt);

                String resetUrl = frontendUrl + "/reset-password?token=" + token;
                String subject = "[ITing] Đặt lại mật khẩu";
                String body = "Chào bạn,\n\n" +
                        "Vui lòng nhấn liên kết sau để đặt lại mật khẩu (hết hạn trong 1 giờ):\n\n" +
                        resetUrl + "\n\n" +
                        "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.";

                emailService.sendEmail(account.getEmail(), subject, body);
                log.info("Password reset token created and email sent to {}", account.getEmail());
            } catch (Exception e) {
                log.error("Failed to create password reset token for {}: {}", email, e.getMessage());
            }
        });
        // If account not found, do nothing to avoid exposing account existence
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (prt.isUsed() || prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired token");
        }

        Account account = prt.getAccount();
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        prt.setUsed(true);
        tokenRepository.save(prt);
        log.info("Password reset successful for account {}", account.getEmail());
    }
}

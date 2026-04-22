package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.entity.OtpCode;
import com.iting.jobportal.auth.entity.PasswordResetToken;
import com.iting.jobportal.auth.repository.OtpCodeRepository;
import com.iting.jobportal.auth.repository.PasswordResetTokenRepository;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.service.PasswordResetService;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.common.service.EmailTemplateService;
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
    private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    @Override
    @Transactional
    public void createPasswordResetToken(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        accountRepository.findByEmail(normalizedEmail).ifPresent(account -> {
            try {
                String otp = String.format("%06d", (int) (Math.random() * 1000000));
                
                // Clear old OTPs for reset
                otpCodeRepository.deleteByEmail(normalizedEmail);

                OtpCode otpCode = OtpCode.builder()
                        .email(normalizedEmail)
                        .code(otp)
                        .expiryTime(LocalDateTime.now().plusMinutes(10))
                        .isVerification(false) // false indicates RESET_PASSWORD
                        .build();

                otpCodeRepository.save(otpCode);

                String subject = "[ITing] Mã xác thực đặt lại mật khẩu";
                String htmlContent = emailTemplateService.getOtpTemplate(normalizedEmail, otp, "RESET_PASSWORD");

                emailService.sendHtmlEmail(normalizedEmail, subject, htmlContent);
                log.info("Password reset OTP created and email sent to {}", normalizedEmail);
            } catch (Exception e) {
                log.error("Failed to create password reset OTP for {}: {}", normalizedEmail, e.getMessage());
            }
        });
    }

    @Override
    @Transactional
    public void resetPassword(String email, String otpCode, String newPassword) {
        String normalizedEmail = email.trim().toLowerCase();
        OtpCode storedOtp = otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(normalizedEmail, false)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã xác thực cho email: " + normalizedEmail));

        if (!storedOtp.getCode().equals(otpCode.trim())) {
            throw new RuntimeException("Mã xác thực không chính xác");
        }

        if (storedOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn");
        }

        Account account = accountRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        // Update password
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        accountRepository.save(account);

        // Clear OTP after success
        otpCodeRepository.deleteByEmail(normalizedEmail);
        
        log.info("Password reset successful via OTP for account {}", normalizedEmail);
    }
}

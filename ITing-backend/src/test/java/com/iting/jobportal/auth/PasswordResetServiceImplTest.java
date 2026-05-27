package com.iting.jobportal.auth;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.OtpCode;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.repository.OtpCodeRepository;
import com.iting.jobportal.auth.service.impl.PasswordResetServiceImpl;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.common.service.EmailTemplateService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceImplTest {

    @Mock private AccountRepository accountRepository;
    @Mock private OtpCodeRepository otpCodeRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private EmailTemplateService emailTemplateService;

    @InjectMocks
    private PasswordResetServiceImpl service;

    // ─────────────── createPasswordResetToken ───────────────

    @Test
    void createPasswordResetToken_existingAccount_savesOtpAndSendsEmail() throws Exception {
        Account account = Account.builder().id(1L).email("user@test.com").build();
        when(accountRepository.findByEmail("user@test.com")).thenReturn(Optional.of(account));
        when(emailTemplateService.getOtpTemplate(anyString(), anyString(), eq("RESET_PASSWORD")))
                .thenReturn("<html>OTP</html>");

        service.createPasswordResetToken("USER@test.com");

        // Email normalize (trim + lowercase)
        verify(otpCodeRepository).deleteByEmail("user@test.com");

        ArgumentCaptor<OtpCode> captor = ArgumentCaptor.forClass(OtpCode.class);
        verify(otpCodeRepository).save(captor.capture());
        OtpCode saved = captor.getValue();

        assertEquals("user@test.com", saved.getEmail());
        assertEquals(6, saved.getCode().length());
        assertTrue(saved.getCode().matches("\\d{6}"));
        assertFalse(saved.isVerification(),
                "isVerification phải false để phân biệt RESET_PASSWORD với verify email");
        assertTrue(saved.getExpiryTime().isAfter(LocalDateTime.now().plusMinutes(9)));
        assertTrue(saved.getExpiryTime().isBefore(LocalDateTime.now().plusMinutes(11)));

        verify(emailService).sendHtmlEmail(eq("user@test.com"), contains("đặt lại mật khẩu"), anyString());
    }

    @Test
    void createPasswordResetToken_unknownEmail_silentlySkips() {
        // Bảo mật: không leak việc email có tồn tại hay không
        when(accountRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        service.createPasswordResetToken("ghost@test.com");

        verify(otpCodeRepository, never()).save(any());
        verify(emailService, never()).sendHtmlEmail(anyString(), anyString(), anyString());
    }

    @Test
    void createPasswordResetToken_emailServiceFails_doesNotThrow() throws Exception {
        // Email fail không được làm crash service — chỉ log warning
        Account account = Account.builder().id(1L).email("user@test.com").build();
        when(accountRepository.findByEmail("user@test.com")).thenReturn(Optional.of(account));
        when(emailTemplateService.getOtpTemplate(anyString(), anyString(), anyString()))
                .thenReturn("<html>OTP</html>");
        doThrow(new RuntimeException("SMTP down"))
                .when(emailService).sendHtmlEmail(anyString(), anyString(), anyString());

        assertDoesNotThrow(() -> service.createPasswordResetToken("user@test.com"));
    }

    // ─────────────── resetPassword ───────────────

    @Test
    void resetPassword_validOtp_updatesPasswordAndClearsOtp() {
        Account account = Account.builder().id(1L).email("user@test.com")
                .passwordHash("OLD_HASH").build();
        OtpCode otp = OtpCode.builder()
                .email("user@test.com").code("123456")
                .expiryTime(LocalDateTime.now().plusMinutes(5)).build();

        when(otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc("user@test.com", false))
                .thenReturn(Optional.of(otp));
        when(accountRepository.findByEmail("user@test.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.encode("NewSecret123!")).thenReturn("NEW_HASH");

        service.resetPassword("USER@TEST.COM ", "123456 ", "NewSecret123!");

        assertEquals("NEW_HASH", account.getPasswordHash(),
                "Password hash phải được update sang hash mới");
        verify(accountRepository).save(account);
        verify(otpCodeRepository).deleteByEmail("user@test.com");
    }

    @Test
    void resetPassword_noOtpFound_throws() {
        when(otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(eq("u@test.com"), eq(false)))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.resetPassword("u@test.com", "123456", "newpass"));
        assertTrue(ex.getMessage().contains("Không tìm thấy mã"));
        verify(accountRepository, never()).save(any());
    }

    @Test
    void resetPassword_wrongOtp_throws() {
        OtpCode otp = OtpCode.builder().code("111111")
                .expiryTime(LocalDateTime.now().plusMinutes(5)).build();
        when(otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(anyString(), eq(false)))
                .thenReturn(Optional.of(otp));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.resetPassword("u@test.com", "999999", "newpass"));
        assertTrue(ex.getMessage().contains("không chính xác"));
        verify(accountRepository, never()).save(any());
        verify(otpCodeRepository, never()).deleteByEmail(anyString());
    }

    @Test
    void resetPassword_expiredOtp_throws() {
        OtpCode otp = OtpCode.builder().code("123456")
                .expiryTime(LocalDateTime.now().minusMinutes(1)).build();
        when(otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(anyString(), eq(false)))
                .thenReturn(Optional.of(otp));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.resetPassword("u@test.com", "123456", "newpass"));
        assertTrue(ex.getMessage().contains("hết hạn"));
        verify(accountRepository, never()).save(any());
    }

    @Test
    void resetPassword_accountNotFound_throws() {
        OtpCode otp = OtpCode.builder().code("123456")
                .expiryTime(LocalDateTime.now().plusMinutes(5)).build();
        when(otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(anyString(), eq(false)))
                .thenReturn(Optional.of(otp));
        when(accountRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.resetPassword("u@test.com", "123456", "newpass"));
        assertTrue(ex.getMessage().contains("tài khoản"));
    }

    @Test
    void resetPassword_emailNormalization_trimAndLowercase() {
        Account account = Account.builder().id(1L).email("user@test.com")
                .passwordHash("OLD").build();
        OtpCode otp = OtpCode.builder().code("123456")
                .expiryTime(LocalDateTime.now().plusMinutes(5)).build();
        when(otpCodeRepository.findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(eq("user@test.com"), eq(false)))
                .thenReturn(Optional.of(otp));
        when(accountRepository.findByEmail("user@test.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.encode(anyString())).thenReturn("HASH");

        // Email "  USER@Test.COM  " phải normalize thành "user@test.com"
        service.resetPassword("  USER@Test.COM  ", "123456", "newpass");

        verify(otpCodeRepository).findTopByEmailAndIsVerificationOrderByExpiryTimeDesc("user@test.com", false);
        verify(accountRepository).findByEmail("user@test.com");
    }
}

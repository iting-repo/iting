package com.iting.jobportal.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.repository.OtpCodeRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.service.RefreshTokenService;
import com.iting.jobportal.auth.service.impl.AuthServiceImpl;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.common.service.EmailTemplateService;
import com.iting.jobportal.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock private AccountRepository accountRepository;

  @Mock private UserRepository userRepository;

  @Mock private PasswordEncoder passwordEncoder;

  @Mock private JwtTokenUtil jwtTokenUtil;

  @Mock private RefreshTokenService refreshTokenService;

  @Mock private OtpCodeRepository otpCodeRepository;

  @Mock private EmailService emailService;

  @Mock private EmailTemplateService emailTemplateService;

  @Mock private com.iting.jobportal.admin.service.AdminConfigService adminConfigService;

  @InjectMocks private AuthServiceImpl authService;

  private Account testAccount;
  private RegisterRequest registerRequest;

  @BeforeEach
  void setUp() {
    testAccount =
        Account.builder()
            .id(1L)
            .email("test@example.com")
            .passwordHash("hashedPassword")
            .role(Role.CANDIDATE)
            .status(AccountStatus.ACTIVE)
            .build();

    registerRequest = new RegisterRequest();
    registerRequest.setEmail("test@example.com");
    registerRequest.setPassword("password");
    registerRequest.setRole(Role.CANDIDATE);
  }

  @Test
  void register_shouldCreateAccountAndUser() {
    // Impl uses findByEmail() (not existsByEmail) to detect duplicates.
    when(accountRepository.findByEmail(anyString())).thenReturn(Optional.empty());
    when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
    when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

    Account result = authService.register(registerRequest);

    assertNotNull(result);
    assertEquals(testAccount.getEmail(), result.getEmail());
    verify(userRepository, times(1)).save(any());
  }

  @Test
  void register_withDuplicateEmail_shouldThrowException() {
    // Duplicate = existing account that is already activated (not PENDING + has lastLoginAt)
    Account existing =
        Account.builder()
            .id(99L)
            .email("test@example.com")
            .passwordHash("hashed")
            .role(Role.CANDIDATE)
            .status(AccountStatus.ACTIVE)
            .lastLoginAt(java.time.LocalDateTime.now())
            .build();
    when(accountRepository.findByEmail(anyString())).thenReturn(Optional.of(existing));

    assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
  }

  @Test
  void login_withBannedAccount_shouldThrow() {
    testAccount.setStatus(AccountStatus.BANNED);
    when(accountRepository.findByEmail(anyString())).thenReturn(Optional.of(testAccount));
    when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

    LoginRequest loginRequest = new LoginRequest();
    loginRequest.setEmail("test@example.com");
    loginRequest.setPassword("password");

    RuntimeException exception =
        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    assertTrue(exception.getMessage().contains("bị khóa"));
  }

  // ── Đăng nhập sai nhiều lần → khóa tạm thời (maxLoginAttempts/lockoutDuration) ──

  private com.iting.jobportal.admin.entity.SystemConfig securityConfig(
      int maxAttempts, int lockoutMinutes, boolean requireEmailVerification) {
    return com.iting.jobportal.admin.entity.SystemConfig.builder()
        .maxLoginAttempts(maxAttempts)
        .lockoutDuration(lockoutMinutes)
        .requireEmailVerification(requireEmailVerification)
        .build();
  }

  @Test
  void login_wrongPasswordReachingThreshold_locksAccount() {
    testAccount.setFailedLoginAttempts(2); // lần này là lần thứ 3
    when(accountRepository.findByEmail(anyString())).thenReturn(Optional.of(testAccount));
    when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
    when(adminConfigService.getConfig()).thenReturn(securityConfig(3, 30, false));

    LoginRequest req = new LoginRequest();
    req.setEmail("test@example.com");
    req.setPassword("wrong");

    RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
    assertTrue(ex.getMessage().contains("tạm khóa"));
    assertNotNull(testAccount.getLockedUntil(), "lockedUntil phải được set khi vượt ngưỡng");
    verify(accountRepository).save(testAccount);
  }

  @Test
  void login_whenAlreadyLocked_throwsBeforePasswordCheck() {
    testAccount.setLockedUntil(java.time.LocalDateTime.now().plusMinutes(10));
    when(accountRepository.findByEmail(anyString())).thenReturn(Optional.of(testAccount));
    when(adminConfigService.getConfig()).thenReturn(securityConfig(5, 30, false));

    LoginRequest req = new LoginRequest();
    req.setEmail("test@example.com");
    req.setPassword("whatever");

    RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
    assertTrue(ex.getMessage().contains("tạm khóa"));
    // không kiểm tra mật khẩu khi đang bị khóa
    verify(passwordEncoder, never()).matches(anyString(), anyString());
  }

  @Test
  void login_requireEmailVerification_blocksPendingAccount() {
    testAccount.setStatus(AccountStatus.PENDING);
    when(accountRepository.findByEmail(anyString())).thenReturn(Optional.of(testAccount));
    when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
    when(adminConfigService.getConfig()).thenReturn(securityConfig(5, 30, true));

    LoginRequest req = new LoginRequest();
    req.setEmail("test@example.com");
    req.setPassword("password");

    RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
    assertTrue(ex.getMessage().contains("xác minh email"));
  }

  @Test
  void login_success_resetsFailedAttempts() {
    testAccount.setFailedLoginAttempts(4);
    when(accountRepository.findByEmail(anyString())).thenReturn(Optional.of(testAccount));
    when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
    when(adminConfigService.getConfig()).thenReturn(securityConfig(5, 30, false));
    when(jwtTokenUtil.generateToken(any(), anyString(), anyString())).thenReturn("jwt");
    when(refreshTokenService.createRefreshToken(any(), anyString(), anyString(), anyString()))
        .thenReturn(
            com.iting.jobportal.auth.entity.RefreshToken.builder().token("refresh").build());

    LoginRequest req = new LoginRequest();
    req.setEmail("test@example.com");
    req.setPassword("password");

    var resp = authService.login(req);
    assertNotNull(resp);
    assertEquals(0, testAccount.getFailedLoginAttempts());
    assertNull(testAccount.getLockedUntil());
  }
}

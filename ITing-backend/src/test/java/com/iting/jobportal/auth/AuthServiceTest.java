package com.iting.jobportal.auth;

import com.iting.jobportal.auth.dto.request.LoginRequest;
import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.dto.response.LoginResponse;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.repository.OtpCodeRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.service.RefreshTokenService;
import com.iting.jobportal.auth.service.impl.AuthServiceImpl;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private OtpCodeRepository otpCodeRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    private Account testAccount;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        testAccount = Account.builder()
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
        when(accountRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        Account result = authService.register(registerRequest);

        assertNotNull(result);
        assertEquals(testAccount.getEmail(), result.getEmail());
        verify(userRepository, times(1)).save(any());
    }

    @Test
    void register_withDuplicateEmail_shouldThrowException() {
        when(accountRepository.existsByEmail(anyString())).thenReturn(true);

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

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertTrue(exception.getMessage().contains("bị khóa"));
    }
}

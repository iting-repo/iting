package com.iting.jobportal.auth;

import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.service.AuthService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("ci")
@Tag("integration")
class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AccountRepository accountRepository;

    @Test
    void register_shouldCreateAccountAndUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("integration@example.com");
        request.setPassword("password123");
        request.setRole(Role.CANDIDATE);

        Account account = authService.register(request);

        assertNotNull(account);
        assertNotNull(account.getId());
        assertEquals("integration@example.com", account.getEmail());
    }

    /**
     * Email đã verify (ACTIVE + lastLoginAt != null) phải bị reject khi register lại.
     * (PENDING account chưa verify OTP thì được phép register đè — đó là UX cố ý.)
     */
    @Test
    void register_duplicateEmail_onVerifiedAccount_shouldThrowException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicate@example.com");
        request.setPassword("password");
        request.setRole(Role.CANDIDATE);

        Account account = authService.register(request);
        // Mô phỏng user đã verify OTP + login: chuyển sang ACTIVE và set lastLoginAt
        account.setStatus(AccountStatus.ACTIVE);
        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.saveAndFlush(account);

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }
}

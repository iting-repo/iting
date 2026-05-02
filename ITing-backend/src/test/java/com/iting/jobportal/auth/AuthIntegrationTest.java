package com.iting.jobportal.auth;

import com.iting.jobportal.auth.dto.request.RegisterRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.service.AuthService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("ci")
@Tag("integration")
class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

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

    @Test
    void register_duplicateEmail_shouldThrowException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicate@example.com");
        request.setPassword("password");
        request.setRole(Role.CANDIDATE);

        authService.register(request);

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }
}

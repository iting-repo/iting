package com.iting.jobportal.admin.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAccountLockControllerTest {

    @Mock private AccountRepository accountRepository;
    @InjectMocks private AdminAccountLockController controller;

    // ── listLocked ───────────────────────────────────────────────────────

    @Test
    void listLocked_mapsAllFields() {
        Account locked = new Account();
        locked.setId(5L);
        locked.setEmail("locked@x.y");
        locked.setFullName("Locked User");
        locked.setRole(Role.CANDIDATE);
        locked.setFailedLoginAttempts(5);
        locked.setLockedUntil(LocalDateTime.of(2026, 6, 1, 12, 0));
        locked.setLastLoginAt(LocalDateTime.of(2026, 5, 25, 9, 0));

        when(accountRepository.findByLockedUntilAfter(any(LocalDateTime.class)))
                .thenReturn(List.of(locked));

        ResponseEntity<List<Map<String, Object>>> resp = controller.listLocked();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        List<Map<String, Object>> body = resp.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());
        Map<String, Object> m = body.get(0);
        assertEquals(5L, m.get("id"));
        assertEquals("locked@x.y", m.get("email"));
        assertEquals("Locked User", m.get("fullName"));
        assertEquals("CANDIDATE", m.get("role"));
        assertEquals(5, m.get("failedLoginAttempts"));
        assertNotNull(m.get("lockedUntil"));
    }

    @Test
    void listLocked_nullRole_returnsNullString() {
        Account locked = new Account();
        locked.setId(5L);
        locked.setRole(null);
        when(accountRepository.findByLockedUntilAfter(any(LocalDateTime.class)))
                .thenReturn(List.of(locked));

        assertNull(controller.listLocked().getBody().get(0).get("role"));
    }

    @Test
    void listLocked_empty_returnsEmptyList() {
        when(accountRepository.findByLockedUntilAfter(any(LocalDateTime.class))).thenReturn(List.of());
        assertEquals(0, controller.listLocked().getBody().size());
    }

    // ── unlock ───────────────────────────────────────────────────────────

    @Test
    void unlock_clearsLockedUntil_andResetsFailedAttempts() {
        Account locked = new Account();
        locked.setId(5L);
        locked.setLockedUntil(LocalDateTime.now().plusMinutes(30));
        locked.setFailedLoginAttempts(5);
        when(accountRepository.findById(5L)).thenReturn(Optional.of(locked));
        when(accountRepository.save(locked)).thenReturn(locked);

        ResponseEntity<Map<String, String>> resp = controller.unlock(5L);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("Đã unlock account #5", resp.getBody().get("message"));

        ArgumentCaptor<Account> cap = ArgumentCaptor.forClass(Account.class);
        verify(accountRepository).save(cap.capture());
        assertNull(cap.getValue().getLockedUntil());
        assertEquals(0, cap.getValue().getFailedLoginAttempts());
    }

    @Test
    void unlock_accountNotFound_throws404_noSave() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.unlock(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(accountRepository, never()).save(any(Account.class));
    }
}

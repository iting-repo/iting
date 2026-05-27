package com.iting.jobportal.notification.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.notification.dto.NotificationPreferenceDto;
import com.iting.jobportal.notification.entity.NotificationPreference;
import com.iting.jobportal.notification.repository.NotificationPreferenceRepository;
import com.iting.jobportal.notification.service.impl.NotificationPreferenceServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationPreferenceServiceImplTest {

    @Mock private NotificationPreferenceRepository repository;
    @Mock private AccountRepository accountRepository;

    @InjectMocks
    private NotificationPreferenceServiceImpl service;

    // ─────────────── getOrCreate ───────────────

    @Test
    void getOrCreate_existingPreference_returnsExisting() {
        NotificationPreference existing = NotificationPreference.builder()
                .id(1L)
                .jobAlerts(false)
                .applicationUpdates(true)
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        NotificationPreferenceDto result = service.getOrCreate(1L);

        assertNotNull(result);
        assertEquals(false, result.getJobAlerts());
        assertEquals(true, result.getApplicationUpdates());
        verify(repository, never()).save(any());
    }

    @Test
    void getOrCreate_missingPreference_createsDefaults() {
        Account account = Account.builder().id(1L).email("u@test.com").build();
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(repository.save(any(NotificationPreference.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationPreferenceDto result = service.getOrCreate(1L);

        ArgumentCaptor<NotificationPreference> captor = ArgumentCaptor.forClass(NotificationPreference.class);
        verify(repository).save(captor.capture());
        NotificationPreference saved = captor.getValue();

        // Default flags: bật hầu hết, tắt promotions + smsEnabled + quietHoursEnabled + systemUpdates
        assertTrue(saved.getJobAlerts());
        assertTrue(saved.getApplicationUpdates());
        assertTrue(saved.getNewMessages());
        assertFalse(saved.getPromotions());
        assertFalse(saved.getSmsEnabled());
        assertFalse(saved.getQuietHoursEnabled());
        assertEquals(LocalTime.of(22, 0), saved.getQuietHoursFrom());
        assertEquals(LocalTime.of(7, 0), saved.getQuietHoursTo());
        assertNotNull(result);
    }

    @Test
    void getOrCreate_missingPreferenceAndMissingAccount_throws404() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.getOrCreate(99L));
        assertEquals(404, ex.getStatusCode().value());
    }

    // ─────────────── update ───────────────

    @Test
    void update_partial_onlyAppliesNonNullFields() {
        NotificationPreference existing = NotificationPreference.builder()
                .id(1L)
                .jobAlerts(true)
                .applicationUpdates(true)
                .newMessages(true)
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        // DTO chỉ có applicationUpdates = false, các field khác null
        NotificationPreferenceDto dto = NotificationPreferenceDto.builder()
                .applicationUpdates(false)
                .build();

        NotificationPreferenceDto result = service.update(1L, dto);

        assertEquals(true, existing.getJobAlerts());           // không đổi (DTO null)
        assertEquals(false, existing.getApplicationUpdates()); // bị override
        assertEquals(true, existing.getNewMessages());         // không đổi
        assertNotNull(result);
    }

    @Test
    void update_allFlags_updatesAll() {
        NotificationPreference existing = NotificationPreference.builder()
                .id(1L).jobAlerts(true).applicationUpdates(true).newMessages(true)
                .recommendations(true).systemUpdates(false).promotions(false)
                .weeklyDigest(true).followedCompanies(true)
                .emailEnabled(true).pushEnabled(true).smsEnabled(false).soundEnabled(true)
                .quietHoursEnabled(false)
                .quietHoursFrom(LocalTime.of(22, 0)).quietHoursTo(LocalTime.of(7, 0))
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        NotificationPreferenceDto dto = NotificationPreferenceDto.builder()
                .jobAlerts(false).applicationUpdates(false).newMessages(false)
                .recommendations(false).systemUpdates(true).promotions(true)
                .weeklyDigest(false).followedCompanies(false)
                .emailEnabled(false).pushEnabled(false).smsEnabled(true).soundEnabled(false)
                .quietHoursEnabled(true)
                .quietHoursFrom(LocalTime.of(23, 30))
                .quietHoursTo(LocalTime.of(8, 30))
                .build();

        service.update(1L, dto);

        assertFalse(existing.getJobAlerts());
        assertFalse(existing.getApplicationUpdates());
        assertTrue(existing.getSystemUpdates());
        assertTrue(existing.getQuietHoursEnabled());
        assertEquals(LocalTime.of(23, 30), existing.getQuietHoursFrom());
        assertEquals(LocalTime.of(8, 30), existing.getQuietHoursTo());
    }

    @Test
    void update_quietHoursEnabledWithSameStartEnd_throws400() {
        NotificationPreference existing = NotificationPreference.builder()
                .id(1L)
                .quietHoursEnabled(false)
                .quietHoursFrom(LocalTime.of(22, 0))
                .quietHoursTo(LocalTime.of(7, 0))
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        // Bật quiet hours + từ == đến → BAD_REQUEST (im lặng cả ngày vô tình)
        NotificationPreferenceDto dto = NotificationPreferenceDto.builder()
                .quietHoursEnabled(true)
                .quietHoursFrom(LocalTime.of(10, 0))
                .quietHoursTo(LocalTime.of(10, 0))
                .build();

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.update(1L, dto));
        assertEquals(400, ex.getStatusCode().value());
        assertTrue(ex.getReason() != null && ex.getReason().contains("im lặng"));
        verify(repository, never()).save(any());
    }

    @Test
    void update_quietHoursEnabledDifferentStartEnd_ok() {
        NotificationPreference existing = NotificationPreference.builder()
                .id(1L).quietHoursEnabled(false).build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        NotificationPreferenceDto dto = NotificationPreferenceDto.builder()
                .quietHoursEnabled(true)
                .quietHoursFrom(LocalTime.of(22, 0))
                .quietHoursTo(LocalTime.of(7, 0))
                .build();

        // Phải không throw
        assertDoesNotThrow(() -> service.update(1L, dto));
    }

    @Test
    void update_missingPreference_createsDefaultFirst() {
        Account account = Account.builder().id(1L).build();
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        NotificationPreferenceDto dto = NotificationPreferenceDto.builder()
                .jobAlerts(false)
                .build();

        service.update(1L, dto);

        // save() được gọi 2 lần: 1 lần createDefault + 1 lần save sau khi apply DTO
        verify(repository, times(2)).save(any());
    }

    @Test
    void update_quietHoursDisabledWithSameTimes_noError() {
        // Tắt quiet hours thì from == to cũng OK (validate chỉ áp dụng khi enabled)
        NotificationPreference existing = NotificationPreference.builder()
                .id(1L)
                .quietHoursEnabled(false)
                .quietHoursFrom(LocalTime.of(10, 0))
                .quietHoursTo(LocalTime.of(10, 0))
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        NotificationPreferenceDto dto = NotificationPreferenceDto.builder()
                .quietHoursEnabled(false)
                .build();

        assertDoesNotThrow(() -> service.update(1L, dto));
    }
}

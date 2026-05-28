package com.iting.jobportal.recommendation.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.recommendation.entity.UserJobInteraction;
import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InteractionServiceImplTest {

    @Mock private UserJobInteractionRepository interactionRepository;
    @Mock private UserSearchHistoryRepository searchHistoryRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private JobRepository jobRepository;

    @InjectMocks private InteractionServiceImpl service;

    // ── trackInteraction ────────────────────────────────────────────────

    @Test
    void trackInteraction_happyPath_savesWithWeight() {
        Account a = new Account(); a.setId(1L);
        Job j = Job.builder().id(42L).build();
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));
        when(jobRepository.findById(42L)).thenReturn(Optional.of(j));

        service.trackInteraction(1L, 42L, InteractionType.APPLY);

        ArgumentCaptor<UserJobInteraction> cap = ArgumentCaptor.forClass(UserJobInteraction.class);
        verify(interactionRepository).save(cap.capture());
        UserJobInteraction saved = cap.getValue();
        assertSame(a, saved.getAccount());
        assertSame(j, saved.getJob());
        assertEquals(InteractionType.APPLY, saved.getInteractionType());
        assertEquals(InteractionType.APPLY.getWeight(), saved.getWeight());
    }

    @Test
    void trackInteraction_nullUserId_skipsImmediately() {
        service.trackInteraction(null, 42L, InteractionType.VIEW);

        verify(accountRepository, never()).findById(any());
        verify(interactionRepository, never()).save(any());
    }

    @Test
    void trackInteraction_accountNotFound_doesNotSave() {
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());
        when(jobRepository.findById(42L)).thenReturn(Optional.of(Job.builder().build()));

        service.trackInteraction(1L, 42L, InteractionType.VIEW);

        verify(interactionRepository, never()).save(any());
    }

    @Test
    void trackInteraction_jobNotFound_doesNotSave() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(new Account()));
        when(jobRepository.findById(42L)).thenReturn(Optional.empty());

        service.trackInteraction(1L, 42L, InteractionType.VIEW);

        verify(interactionRepository, never()).save(any());
    }

    @Test
    void trackInteraction_repoThrows_isCaught_doesNotPropagate() {
        when(accountRepository.findById(1L))
                .thenThrow(new RuntimeException("DB down"));

        // Tracking is best-effort — must NOT crash caller (e.g. apply flow)
        service.trackInteraction(1L, 42L, InteractionType.VIEW);

        verify(interactionRepository, never()).save(any());
    }

    // ── trackSearch ─────────────────────────────────────────────────────

    @Test
    void trackSearch_happyPath_savesWithKeywordAndLocation() {
        Account a = new Account(); a.setId(1L);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

        service.trackSearch(1L, "java", "HCM");

        ArgumentCaptor<UserSearchHistory> cap = ArgumentCaptor.forClass(UserSearchHistory.class);
        verify(searchHistoryRepository).save(cap.capture());
        UserSearchHistory saved = cap.getValue();
        assertSame(a, saved.getAccount());
        assertEquals("java", saved.getKeyword());
        assertEquals("HCM", saved.getLocation());
    }

    @Test
    void trackSearch_nullUserId_skips() {
        service.trackSearch(null, "java", null);

        verify(accountRepository, never()).findById(any());
        verify(searchHistoryRepository, never()).save(any());
    }

    @Test
    void trackSearch_accountNotFound_doesNotSave() {
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        service.trackSearch(1L, "java", null);

        verify(searchHistoryRepository, never()).save(any());
    }

    @Test
    void trackSearch_repoThrows_isCaught() {
        when(accountRepository.findById(1L)).thenThrow(new RuntimeException("DB down"));

        service.trackSearch(1L, "java", null);
        // không exception — best-effort
    }

    // ── hasEnoughBehavior thresholds ────────────────────────────────────

    @Test
    void hasEnoughBehavior_nullUserId_returnsFalse() {
        assertFalse(service.hasEnoughBehavior(null));
    }

    @Test
    void hasEnoughBehavior_views5_isEnough() {
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(5L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
        when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

        assertTrue(service.hasEnoughBehavior(1L));
    }

    @Test
    void hasEnoughBehavior_searches3_isEnough() {
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
        when(searchHistoryRepository.countByAccountId(1L)).thenReturn(3L);

        assertTrue(service.hasEnoughBehavior(1L));
    }

    @Test
    void hasEnoughBehavior_applies1_isEnough() {
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(1L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
        when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

        assertTrue(service.hasEnoughBehavior(1L));
    }

    @Test
    void hasEnoughBehavior_saves2_isEnough() {
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(2L);
        when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

        assertTrue(service.hasEnoughBehavior(1L));
    }

    @Test
    void hasEnoughBehavior_belowAllThresholds_false() {
        // 4 views, 0 apply, 1 save, 2 searches — every count below threshold
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(4L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(1L);
        when(searchHistoryRepository.countByAccountId(1L)).thenReturn(2L);

        assertFalse(service.hasEnoughBehavior(1L));
    }

    @Test
    void hasEnoughBehavior_allZero_false() {
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
        when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
        when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

        assertFalse(service.hasEnoughBehavior(1L));
    }
}

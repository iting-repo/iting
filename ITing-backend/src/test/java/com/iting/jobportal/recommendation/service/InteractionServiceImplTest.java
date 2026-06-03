package com.iting.jobportal.recommendation.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import com.iting.jobportal.recommendation.service.impl.InteractionServiceImpl;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InteractionServiceImplTest {

  @Mock private UserJobInteractionRepository interactionRepository;
  @Mock private UserSearchHistoryRepository searchHistoryRepository;
  @Mock private AccountRepository accountRepository;
  @Mock private JobRepository jobRepository;
  @InjectMocks private InteractionServiceImpl service;

  // ── trackInteraction ──────────────────────────────────────────

  @Test
  void trackInteraction_whenUserIdNull_doesNothing() {
    service.trackInteraction(null, 1L, InteractionType.VIEW);

    verifyNoInteractions(accountRepository, jobRepository, interactionRepository);
  }

  @Test
  void trackInteraction_whenAccountNotFound_doesNotSave() {
    when(accountRepository.findById(1L)).thenReturn(Optional.empty());
    when(jobRepository.findById(10L)).thenReturn(Optional.of(new Job()));

    service.trackInteraction(1L, 10L, InteractionType.VIEW);

    verify(interactionRepository, never()).save(any());
  }

  @Test
  void trackInteraction_whenJobNotFound_doesNotSave() {
    when(accountRepository.findById(1L)).thenReturn(Optional.of(new Account()));
    when(jobRepository.findById(10L)).thenReturn(Optional.empty());

    service.trackInteraction(1L, 10L, InteractionType.VIEW);

    verify(interactionRepository, never()).save(any());
  }

  @Test
  void trackInteraction_whenBothExist_savesInteraction() {
    Account account = new Account();
    Job job = new Job();
    when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
    when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

    service.trackInteraction(1L, 10L, InteractionType.APPLY);

    verify(interactionRepository).save(any());
  }

  @Test
  void trackInteraction_whenExceptionThrown_doesNotPropagate() {
    when(accountRepository.findById(1L)).thenThrow(new RuntimeException("DB down"));

    assertDoesNotThrow(() -> service.trackInteraction(1L, 10L, InteractionType.VIEW));
  }

  // ── trackSearch ───────────────────────────────────────────────

  @Test
  void trackSearch_whenUserIdNull_doesNothing() {
    service.trackSearch(null, "java", "HCM");

    verifyNoInteractions(accountRepository, searchHistoryRepository);
  }

  @Test
  void trackSearch_whenAccountNotFound_doesNotSave() {
    when(accountRepository.findById(1L)).thenReturn(Optional.empty());

    service.trackSearch(1L, "java", "HCM");

    verify(searchHistoryRepository, never()).save(any());
  }

  @Test
  void trackSearch_whenAccountExists_savesHistory() {
    when(accountRepository.findById(1L)).thenReturn(Optional.of(new Account()));

    service.trackSearch(1L, "java developer", "Hanoi");

    verify(searchHistoryRepository).save(any());
  }

  @Test
  void trackSearch_whenExceptionThrown_doesNotPropagate() {
    when(accountRepository.findById(1L)).thenThrow(new RuntimeException("timeout"));

    assertDoesNotThrow(() -> service.trackSearch(1L, "java", null));
  }

  // ── hasEnoughBehavior ─────────────────────────────────────────

  @Test
  void hasEnoughBehavior_whenUserIdNull_returnsFalse() {
    assertFalse(service.hasEnoughBehavior(null));
    verifyNoInteractions(interactionRepository, searchHistoryRepository);
  }

  @Test
  void hasEnoughBehavior_whenAllCountsZero_returnsFalse() {
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
    when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

    assertFalse(service.hasEnoughBehavior(1L));
  }

  @Test
  void hasEnoughBehavior_whenViewsAtThreshold_returnsTrue() {
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(5L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
    when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

    assertTrue(service.hasEnoughBehavior(1L));
  }

  @Test
  void hasEnoughBehavior_whenOneApply_returnsTrue() {
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(1L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
    when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

    assertTrue(service.hasEnoughBehavior(1L));
  }

  @Test
  void hasEnoughBehavior_whenTwoSaves_returnsTrue() {
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(2L);
    when(searchHistoryRepository.countByAccountId(1L)).thenReturn(0L);

    assertTrue(service.hasEnoughBehavior(1L));
  }

  @Test
  void hasEnoughBehavior_whenThreeSearches_returnsTrue() {
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(0L);
    when(searchHistoryRepository.countByAccountId(1L)).thenReturn(3L);

    assertTrue(service.hasEnoughBehavior(1L));
  }

  @Test
  void hasEnoughBehavior_whenJustBelowAllThresholds_returnsFalse() {
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.VIEW)).thenReturn(4L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.APPLY)).thenReturn(0L);
    when(interactionRepository.countByAccountIdAndType(1L, InteractionType.SAVE)).thenReturn(1L);
    when(searchHistoryRepository.countByAccountId(1L)).thenReturn(2L);

    assertFalse(service.hasEnoughBehavior(1L));
  }
}

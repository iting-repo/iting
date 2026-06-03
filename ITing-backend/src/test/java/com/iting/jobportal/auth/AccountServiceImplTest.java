package com.iting.jobportal.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.dto.request.BanRequest;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.BanHistory;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.repository.BanHistoryRepository;
import com.iting.jobportal.auth.service.impl.AccountServiceImpl;
import com.iting.jobportal.common.service.EmailService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AccountServiceImplTest {

  @Mock private AccountRepository accountRepository;

  @Mock private BanHistoryRepository banHistoryRepository;

  @Mock private EmailService emailService;

  @InjectMocks private AccountServiceImpl accountService;

  @Test
  void banAccount_shouldBanSaveHistoryAndSendEmail() {
    Account target =
        Account.builder().id(2L).email("user@test.com").status(AccountStatus.ACTIVE).build();
    Account admin = Account.builder().id(1L).email("admin@test.com").build();
    BanRequest request = new BanRequest();
    request.setReason("spam");
    request.setDurationDays(7);

    when(accountRepository.findById(2L)).thenReturn(Optional.of(target));
    when(accountRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));

    accountService.banAccount(2L, request, "admin@test.com");

    assertEquals(AccountStatus.BANNED, target.getStatus());

    ArgumentCaptor<BanHistory> historyCaptor = ArgumentCaptor.forClass(BanHistory.class);
    verify(banHistoryRepository).save(historyCaptor.capture());
    assertEquals("spam", historyCaptor.getValue().getReason());
    assertTrue(historyCaptor.getValue().getIsActive());
    verify(emailService).sendBanNotification("user@test.com", "spam", 7);
  }

  @Test
  void banAccount_withoutDuration_shouldCreatePermanentBan() {
    Account target =
        Account.builder().id(2L).email("user@test.com").status(AccountStatus.ACTIVE).build();
    Account admin = Account.builder().id(1L).email("admin@test.com").build();
    BanRequest request = new BanRequest();
    request.setReason("serious violation");

    when(accountRepository.findById(2L)).thenReturn(Optional.of(target));
    when(accountRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));

    accountService.banAccount(2L, request, "admin@test.com");

    ArgumentCaptor<BanHistory> historyCaptor = ArgumentCaptor.forClass(BanHistory.class);
    verify(banHistoryRepository).save(historyCaptor.capture());
    assertNull(historyCaptor.getValue().getExpiredAt());
  }

  @Test
  void unbanAccount_shouldActivateAccountAndDisableActiveHistories() {
    Account target = Account.builder().id(2L).status(AccountStatus.BANNED).build();
    BanHistory history = BanHistory.builder().isActive(true).build();

    when(accountRepository.findById(2L)).thenReturn(Optional.of(target));
    when(banHistoryRepository.findByTargetAccountIdAndIsActiveTrue(2L))
        .thenReturn(List.of(history));

    accountService.unbanAccount(2L);

    assertEquals(AccountStatus.ACTIVE, target.getStatus());
    assertEquals(Boolean.FALSE, history.getIsActive());
    verify(banHistoryRepository).saveAll(any());
  }
}

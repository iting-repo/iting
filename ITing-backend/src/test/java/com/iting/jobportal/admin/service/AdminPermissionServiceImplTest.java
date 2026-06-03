package com.iting.jobportal.admin.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import com.iting.jobportal.admin.entity.UserPermissionOverride;
import com.iting.jobportal.admin.repository.UserPermissionOverrideRepository;
import com.iting.jobportal.admin.service.impl.AdminPermissionServiceImpl;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminPermissionServiceImplTest {

  @Mock private UserPermissionOverrideRepository overrideRepository;
  @Mock private AccountRepository accountRepository;

  @InjectMocks private AdminPermissionServiceImpl service;

  private Account admin;
  private Account user;

  @BeforeEach
  void setUp() {
    admin = Account.builder().id(1L).email("admin@test.com").build();
    user = Account.builder().id(2L).email("user@test.com").build();
  }

  // ── getOverrides ─────────────────────────────────────────────

  @Test
  void getOverrides_returnsEmptyMap_whenNoOverridesExist() {
    when(overrideRepository.findByAccountId(2L)).thenReturn(List.of());

    Map<String, Boolean> result = service.getOverrides(2L);

    assertThat(result).isEmpty();
  }

  @Test
  void getOverrides_returnsCorrectMap() {
    UserPermissionOverride o1 =
        UserPermissionOverride.builder()
            .account(user)
            .permissionKey("jobs.create")
            .granted(true)
            .build();
    UserPermissionOverride o2 =
        UserPermissionOverride.builder()
            .account(user)
            .permissionKey("users.delete")
            .granted(false)
            .build();
    when(overrideRepository.findByAccountId(2L)).thenReturn(List.of(o1, o2));

    Map<String, Boolean> result = service.getOverrides(2L);

    assertThat(result).containsEntry("jobs.create", true).containsEntry("users.delete", false);
  }

  // ── replaceOverrides ─────────────────────────────────────────

  @Test
  void replaceOverrides_deletesExistingThenSavesNew() {
    when(accountRepository.findById(2L)).thenReturn(Optional.of(user));
    when(accountRepository.findById(1L)).thenReturn(Optional.of(admin));

    Map<String, Boolean> overrides = Map.of("jobs.create", true, "users.ban", false);
    service.replaceOverrides(1L, 2L, overrides);

    verify(overrideRepository).deleteByAccountId(2L);

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<UserPermissionOverride>> captor = ArgumentCaptor.forClass(List.class);
    verify(overrideRepository).saveAll(captor.capture());

    List<UserPermissionOverride> saved = captor.getValue();
    assertThat(saved).hasSize(2);
    assertThat(saved)
        .extracting(UserPermissionOverride::getPermissionKey)
        .containsExactlyInAnyOrder("jobs.create", "users.ban");
  }

  @Test
  void replaceOverrides_withEmptyMap_onlyDeletesExisting() {
    service.replaceOverrides(1L, 2L, Map.of());

    verify(overrideRepository).deleteByAccountId(2L);
    verify(overrideRepository, never()).saveAll(anyList());
  }

  @Test
  void replaceOverrides_throwsWhenAccountNotFound() {
    when(accountRepository.findById(2L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.replaceOverrides(1L, 2L, Map.of("jobs.create", true)))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Account not found");
  }

  // ── deleteOverride ───────────────────────────────────────────

  @Test
  void deleteOverride_callsRepositoryWithCorrectArgs() {
    service.deleteOverride(1L, 2L, "jobs.create");

    verify(overrideRepository).deleteByAccountIdAndPermissionKey(2L, "jobs.create");
  }

  // ── clearOverrides ────────────────────────────────────────────

  @Test
  void clearOverrides_deletesAllForAccount() {
    service.clearOverrides(1L, 2L);

    verify(overrideRepository).deleteByAccountId(2L);
  }

  // ── bulkReplaceOverrides ──────────────────────────────────────

  @Test
  void bulkReplaceOverrides_appliesOverridesToAllUsers() {
    Account user2 = Account.builder().id(3L).email("user2@test.com").build();
    when(accountRepository.findById(1L)).thenReturn(Optional.of(admin));
    when(accountRepository.findById(2L)).thenReturn(Optional.of(user));
    when(accountRepository.findById(3L)).thenReturn(Optional.of(user2));

    Map<String, Boolean> overrides = Map.of("jobs.create", true);
    service.bulkReplaceOverrides(1L, List.of(2L, 3L), overrides);

    // Each user's old overrides deleted
    verify(overrideRepository).deleteByAccountId(2L);
    verify(overrideRepository).deleteByAccountId(3L);

    // New overrides saved (2 users × 1 permission = 2 entities)
    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<UserPermissionOverride>> captor = ArgumentCaptor.forClass(List.class);
    verify(overrideRepository).saveAll(captor.capture());
    assertThat(captor.getValue()).hasSize(2);
  }

  @Test
  void bulkReplaceOverrides_withEmptyList_doesNothing() {
    service.bulkReplaceOverrides(1L, List.of(), Map.of("jobs.create", true));

    verifyNoInteractions(overrideRepository);
  }
}

package com.iting.jobportal.recommendation.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.recommendation.dto.response.SearchHistoryResponse;
import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class InteractionServiceImplSearchHistoryTest {

  @Mock private UserJobInteractionRepository interactionRepository;
  @Mock private UserSearchHistoryRepository searchHistoryRepository;
  @Mock private AccountRepository accountRepository;
  @Mock private JobRepository jobRepository;

  @InjectMocks private InteractionServiceImpl service;

  // ── getSearchHistory ────────────────────────────────────────────────

  @Test
  void getSearchHistory_nullUser_returnsEmpty() {
    assertTrue(service.getSearchHistory(null, 10).isEmpty());
    verify(searchHistoryRepository, never()).findByAccountIdOrderByCreatedAtDesc(any(), any());
  }

  @Test
  void getSearchHistory_mapsEntitiesToDto() {
    UserSearchHistory h1 = UserSearchHistory.builder().keyword("java").location("HCM").build();
    h1.setId(1L);
    h1.setCreatedAt(LocalDateTime.now());
    UserSearchHistory h2 = UserSearchHistory.builder().keyword("react").build();
    h2.setId(2L);
    h2.setCreatedAt(LocalDateTime.now().minusHours(1));

    when(searchHistoryRepository.findByAccountIdOrderByCreatedAtDesc(eq(7L), any(Pageable.class)))
        .thenReturn(List.of(h1, h2));

    List<SearchHistoryResponse> result = service.getSearchHistory(7L, 10);

    assertEquals(2, result.size());
    assertEquals("java", result.get(0).getKeyword());
    assertEquals("HCM", result.get(0).getLocation());
    assertEquals("react", result.get(1).getKeyword());
  }

  @Test
  void getSearchHistory_limitBelow1_clampsTo1() {
    when(searchHistoryRepository.findByAccountIdOrderByCreatedAtDesc(eq(7L), any(Pageable.class)))
        .thenReturn(List.of());

    service.getSearchHistory(7L, 0);

    ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
    verify(searchHistoryRepository).findByAccountIdOrderByCreatedAtDesc(eq(7L), cap.capture());
    assertEquals(1, cap.getValue().getPageSize());
  }

  @Test
  void getSearchHistory_limitAbove50_clampsTo50() {
    when(searchHistoryRepository.findByAccountIdOrderByCreatedAtDesc(eq(7L), any(Pageable.class)))
        .thenReturn(List.of());

    service.getSearchHistory(7L, 1000);

    ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
    verify(searchHistoryRepository).findByAccountIdOrderByCreatedAtDesc(eq(7L), cap.capture());
    assertEquals(50, cap.getValue().getPageSize());
  }

  // ── deleteSearchHistoryItem ─────────────────────────────────────────

  @Test
  void deleteSearchHistoryItem_nullUser_skips() {
    service.deleteSearchHistoryItem(null, 5L);
    verify(searchHistoryRepository, never()).findByIdAndAccountId(any(), any());
  }

  @Test
  void deleteSearchHistoryItem_nullId_skips() {
    service.deleteSearchHistoryItem(7L, null);
    verify(searchHistoryRepository, never()).findByIdAndAccountId(any(), any());
  }

  @Test
  void deleteSearchHistoryItem_ownedByUser_deletes() {
    UserSearchHistory h = new UserSearchHistory();
    h.setId(5L);
    when(searchHistoryRepository.findByIdAndAccountId(5L, 7L)).thenReturn(Optional.of(h));

    service.deleteSearchHistoryItem(7L, 5L);

    verify(searchHistoryRepository).delete(h);
  }

  @Test
  void deleteSearchHistoryItem_notFound_noOp() {
    when(searchHistoryRepository.findByIdAndAccountId(5L, 7L)).thenReturn(Optional.empty());

    service.deleteSearchHistoryItem(7L, 5L);

    verify(searchHistoryRepository, never()).delete(any(UserSearchHistory.class));
  }

  // ── clearSearchHistory ──────────────────────────────────────────────

  @Test
  void clearSearchHistory_nullUser_returnsZero() {
    assertEquals(0, service.clearSearchHistory(null));
    verify(searchHistoryRepository, never()).deleteAllByAccountId(any());
  }

  @Test
  void clearSearchHistory_delegates() {
    when(searchHistoryRepository.deleteAllByAccountId(7L)).thenReturn(4);

    assertEquals(4, service.clearSearchHistory(7L));
  }

  // ── SearchHistoryResponse.from ──────────────────────────────────────

  @Test
  void searchHistoryResponse_from_mapsAllFields() {
    UserSearchHistory h = UserSearchHistory.builder().keyword("kw").location("HN").build();
    h.setId(99L);
    LocalDateTime now = LocalDateTime.now();
    h.setCreatedAt(now);

    SearchHistoryResponse r = SearchHistoryResponse.from(h);
    assertEquals(99L, r.getId());
    assertEquals("kw", r.getKeyword());
    assertEquals("HN", r.getLocation());
    assertEquals(now, r.getCreatedAt());
    assertNotNull(r);
  }

  // helper for eq() static import
  private static <T> T eq(T value) {
    return org.mockito.ArgumentMatchers.eq(value);
  }
}

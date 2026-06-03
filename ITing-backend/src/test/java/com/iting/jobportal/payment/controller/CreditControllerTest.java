package com.iting.jobportal.payment.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.entity.CreditTransaction;
import com.iting.jobportal.payment.service.CreditService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

/**
 * CreditController test: balance + history endpoints với JWT guard.
 *
 * <p>Cover branches: - balance: success, null credits coerce → 0, account not found, unauth -
 * history: mapping fields, page clamp (size > 100, page < 0), unauth
 */
@ExtendWith(MockitoExtension.class)
class CreditControllerTest {

  @Mock private CreditService creditService;
  @Mock private AccountRepository accountRepository;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private HttpServletRequest request;

  @InjectMocks private CreditController controller;

  // ── getBalance ───────────────────────────────────────────────────────

  @Test
  void getBalance_success_returnsCreditsAndPremiumInfo() {
    LocalDateTime until = LocalDateTime.of(2026, 12, 31, 23, 59);
    Account a = new Account();
    a.setId(1L);
    a.setCredits(120);
    a.setPremiumUntil(until);
    a.setPremiumSource("SUB_PRO");
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

    ResponseEntity<Map<String, Object>> resp = controller.getBalance(request);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    Map<String, Object> body = resp.getBody();
    assertNotNull(body);
    assertEquals(120, body.get("balance"));
    assertEquals(until, body.get("premiumUntil"));
    assertEquals("SUB_PRO", body.get("premiumSource"));
  }

  @Test
  void getBalance_nullCredits_coercesToZero() {
    Account a = new Account();
    a.setId(1L);
    a.setCredits(null); // legacy account chưa được init V101 backfill
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(accountRepository.findById(1L)).thenReturn(Optional.of(a));

    ResponseEntity<Map<String, Object>> resp = controller.getBalance(request);

    assertEquals(0, resp.getBody().get("balance"));
  }

  @Test
  void getBalance_accountNotFound_throws404() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(accountRepository.findById(1L)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getBalance(request));
    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  void getBalance_unauthenticated_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getBalance(request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  // ── getHistory ───────────────────────────────────────────────────────

  @Test
  void getHistory_mapsAllFields_andPaginationMeta() {
    LocalDateTime now = LocalDateTime.now();
    CreditTransaction tx =
        CreditTransaction.builder()
            .id(99L)
            .amount(-5)
            .balanceAfter(15)
            .source("AI_CANDIDATE_MATCH")
            .referenceId(7L)
            .description("Match job #7")
            .build();
    tx.setCreatedAt(now);

    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(creditService.getHistory(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(tx), PageRequest.of(0, 20), 1));

    ResponseEntity<Map<String, Object>> resp = controller.getHistory(0, 20, request);

    Map<String, Object> body = resp.getBody();
    assertNotNull(body);
    assertEquals(0, body.get("page"));
    assertEquals(20, body.get("size"));
    assertEquals(1L, body.get("totalElements"));
    assertEquals(1, body.get("totalPages"));

    @SuppressWarnings("unchecked")
    List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
    assertEquals(1, items.size());
    Map<String, Object> m = items.get(0);
    assertEquals(99L, m.get("id"));
    assertEquals(-5, m.get("amount"));
    assertEquals(15, m.get("balanceAfter"));
    assertEquals("AI_CANDIDATE_MATCH", m.get("source"));
    assertEquals(7L, m.get("referenceId"));
    assertEquals("Match job #7", m.get("description"));
    assertEquals(now, m.get("createdAt"));
  }

  @Test
  void getHistory_clampsSizeAbove100() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(creditService.getHistory(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.getHistory(0, 9999, request);

    ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
    org.mockito.Mockito.verify(creditService).getHistory(eq(1L), cap.capture());
    assertEquals(100, cap.getValue().getPageSize(), "size phải bị clamp xuống 100");
  }

  @Test
  void getHistory_clampsSizeBelow1() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(creditService.getHistory(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.getHistory(0, 0, request);

    ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
    org.mockito.Mockito.verify(creditService).getHistory(eq(1L), cap.capture());
    assertEquals(1, cap.getValue().getPageSize(), "size 0 phải bị clamp lên 1");
  }

  @Test
  void getHistory_negativePage_clampedToZero() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(creditService.getHistory(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.getHistory(-5, 20, request);

    ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
    org.mockito.Mockito.verify(creditService).getHistory(eq(1L), cap.capture());
    assertEquals(0, cap.getValue().getPageNumber());
  }

  @Test
  void getHistory_unauthenticated_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getHistory(0, 20, request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  @Test
  void getHistory_emptyResult_returnsEmptyItems() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(creditService.getHistory(eq(1L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    ResponseEntity<Map<String, Object>> resp = controller.getHistory(0, 20, request);

    @SuppressWarnings("unchecked")
    List<Map<String, Object>> items = (List<Map<String, Object>>) resp.getBody().get("items");
    assertTrue(items.isEmpty());
  }

  // ── helpers ──────────────────────────────────────────────────────────

  private static long eq(long v) {
    return org.mockito.ArgumentMatchers.eq(v);
  }

  private static <T> T any(Class<T> c) {
    return org.mockito.ArgumentMatchers.any(c);
  }
}

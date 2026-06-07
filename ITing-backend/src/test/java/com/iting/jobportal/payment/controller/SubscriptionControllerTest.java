package com.iting.jobportal.payment.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.entity.HrSubscription;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.entity.SubscriptionTierPricing;
import com.iting.jobportal.payment.service.SubscriptionPricingService;
import com.iting.jobportal.payment.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class SubscriptionControllerTest {

  @Mock private SubscriptionService subscriptionService;
  @Mock private SubscriptionPricingService pricingService;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private HttpServletRequest request;

  @InjectMocks private SubscriptionController controller;

  /** Pricing default từ enum — mô phỏng listActive() khi chưa có override trong DB. */
  private static List<SubscriptionTierPricing> enumDefaults() {
    return Arrays.stream(SubscriptionTier.values())
        .map(
            t ->
                SubscriptionTierPricing.builder()
                    .code(t.name())
                    .displayName(t.getDisplayName())
                    .priceVnd(t.getPriceVnd())
                    .periodDays((int) t.getPeriod().toDays())
                    .credits(t.getCredits())
                    .benefits(t.getBenefits())
                    .maxJobsPerMonth(t.getMaxJobsPerMonth())
                    .maxBoostsPerMonth(t.getMaxBoostsPerMonth())
                    .active(true)
                    .build())
        .collect(Collectors.toList());
  }

  // ── listTiers ────────────────────────────────────────────────────────

  @Test
  void listTiers_returnsAllTiersWithAllFields() {
    when(pricingService.listActive()).thenReturn(enumDefaults());

    ResponseEntity<List<Map<String, Object>>> resp = controller.listTiers();

    List<Map<String, Object>> tiers = resp.getBody();
    assertNotNull(tiers);
    assertEquals(SubscriptionTier.values().length, tiers.size());
    for (Map<String, Object> t : tiers) {
      assertNotNull(t.get("code"));
      assertNotNull(t.get("displayName"));
      assertNotNull(t.get("priceVnd"));
      assertNotNull(t.get("periodDays"));
      assertNotNull(t.get("benefits"));
      assertNotNull(t.get("credits"));
    }
  }

  private static SubscriptionTierPricing pricing(String code, boolean active) {
    return SubscriptionTierPricing.builder()
        .code(code)
        .displayName(code + " plan")
        .priceVnd(199000)
        .periodDays(30)
        .credits(50)
        .benefits("Quyền lợi A · Quyền lợi B")
        .maxJobsPerMonth(10)
        .maxBoostsPerMonth(5)
        .active(active)
        .build();
  }

  // ── subscribe ────────────────────────────────────────────────────────

  @Test
  void subscribe_validTier_returnsServiceResult() {
    Map<String, Object> result = Map.of("orderId", 42L);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(pricingService.find("BASIC")).thenReturn(Optional.of(pricing("BASIC", true)));
    when(subscriptionService.createSubscriptionOrder(1L, "BASIC", true)).thenReturn(result);

    ResponseEntity<Map<String, Object>> resp = controller.subscribe("BASIC", true, request);

    assertSame(result, resp.getBody());
  }

  @Test
  void subscribe_usesCanonicalCodeFromPricing() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(pricingService.find("pro")).thenReturn(Optional.of(pricing("PRO", true)));
    when(subscriptionService.createSubscriptionOrder(1L, "PRO", false)).thenReturn(Map.of());

    controller.subscribe("pro", false, request);

    verify(subscriptionService).createSubscriptionOrder(1L, "PRO", false);
  }

  @Test
  void subscribe_invalidTier_throws400() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(pricingService.find("INVALID_TIER")).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.subscribe("INVALID_TIER", true, request));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  void subscribe_inactiveTier_throws400() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(pricingService.find("OLD")).thenReturn(Optional.of(pricing("OLD", false)));

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> controller.subscribe("OLD", true, request));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  void subscribe_unauthenticated_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> controller.subscribe("PRO", true, request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  // ── getMine ──────────────────────────────────────────────────────────

  @Test
  void getMine_activeSubscription_returnsAllFields() {
    SubscriptionTierPricing p = pricing("BASIC", true);
    HrSubscription sub =
        HrSubscription.builder()
            .id(7L)
            .tier("BASIC")
            .startedAt(LocalDateTime.of(2026, 5, 1, 0, 0))
            .expiresAt(LocalDateTime.of(2026, 6, 1, 0, 0))
            .autoRenew(true)
            .status("ACTIVE")
            .build();

    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(subscriptionService.getActiveSubscription(1L)).thenReturn(Optional.of(sub));
    when(pricingService.find("BASIC")).thenReturn(Optional.of(p));

    ResponseEntity<Map<String, Object>> resp = controller.getMine(request);

    Map<String, Object> body = resp.getBody();
    assertNotNull(body);
    assertEquals(true, body.get("active"));
    assertEquals(7L, body.get("id"));
    assertEquals("BASIC", body.get("tier"));
    assertEquals(p.getDisplayName(), body.get("tierDisplayName"));
    assertNotNull(body.get("startedAt"));
    assertNotNull(body.get("expiresAt"));
    assertEquals(true, body.get("autoRenew"));
    assertEquals("ACTIVE", body.get("status"));
  }

  @Test
  void getMine_noActiveSubscription_returnsFreeTier() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
    when(subscriptionService.getActiveSubscription(1L)).thenReturn(Optional.empty());

    ResponseEntity<Map<String, Object>> resp = controller.getMine(request);

    Map<String, Object> body = resp.getBody();
    assertEquals(false, body.get("active"));
    assertEquals("FREE", body.get("tier"));
    assertFalse(body.containsKey("expiresAt"), "FREE tier không có expiresAt");
  }

  @Test
  void getMine_unauthenticated_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.getMine(request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  // ── cancel ───────────────────────────────────────────────────────────

  @Test
  void cancel_withReason_passesReasonToService() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);

    ResponseEntity<Map<String, String>> resp = controller.cancel("Too expensive", request);

    verify(subscriptionService).cancelAutoRenew(1L, "Too expensive");
    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertNotNull(resp.getBody().get("message"));
  }

  @Test
  void cancel_nullReason_usesDefault() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);

    controller.cancel(null, request);

    verify(subscriptionService).cancelAutoRenew(1L, "User-initiated cancel");
  }

  @Test
  void cancel_unauthenticated_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.cancel("x", request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }
}

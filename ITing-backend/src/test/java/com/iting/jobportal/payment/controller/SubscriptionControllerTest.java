package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.entity.HrSubscription;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionControllerTest {

    @Mock private SubscriptionService subscriptionService;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private HttpServletRequest request;

    @InjectMocks private SubscriptionController controller;

    // ── listTiers ────────────────────────────────────────────────────────

    @Test
    void listTiers_returnsAllTiersWithAllFields() {
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

    // ── subscribe ────────────────────────────────────────────────────────

    @Test
    void subscribe_validTier_returnsServiceResult() {
        SubscriptionTier tier = SubscriptionTier.values()[0];
        Map<String, Object> result = Map.of("orderId", 42L);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(subscriptionService.createSubscriptionOrder(1L, tier, true)).thenReturn(result);

        ResponseEntity<Map<String, Object>> resp = controller.subscribe(tier.name(), true, request);

        assertSame(result, resp.getBody());
    }

    @Test
    void subscribe_tierLowercase_isUppercased() {
        SubscriptionTier tier = SubscriptionTier.values()[0];
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(subscriptionService.createSubscriptionOrder(1L, tier, false)).thenReturn(Map.of());

        controller.subscribe(tier.name().toLowerCase(), false, request);

        verify(subscriptionService).createSubscriptionOrder(1L, tier, false);
    }

    @Test
    void subscribe_invalidTier_throws400() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.subscribe("INVALID_TIER", true, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void subscribe_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.subscribe("PRO", true, request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    // ── getMine ──────────────────────────────────────────────────────────

    @Test
    void getMine_activeSubscription_returnsAllFields() {
        SubscriptionTier tier = SubscriptionTier.values()[0];
        HrSubscription sub = HrSubscription.builder()
                .id(7L)
                .tier(tier)
                .startedAt(LocalDateTime.of(2026, 5, 1, 0, 0))
                .expiresAt(LocalDateTime.of(2026, 6, 1, 0, 0))
                .autoRenew(true)
                .status("ACTIVE")
                .build();

        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(subscriptionService.getActiveSubscription(1L)).thenReturn(Optional.of(sub));

        ResponseEntity<Map<String, Object>> resp = controller.getMine(request);

        Map<String, Object> body = resp.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("active"));
        assertEquals(7L, body.get("id"));
        assertEquals(tier.name(), body.get("tier"));
        assertEquals(tier.getDisplayName(), body.get("tierDisplayName"));
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

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.getMine(request));
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

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.cancel("x", request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}

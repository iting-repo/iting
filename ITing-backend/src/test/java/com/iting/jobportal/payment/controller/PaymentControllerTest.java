package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.entity.BoostTier;
import com.iting.jobportal.payment.service.SepayPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock private SepayPaymentService sepayPaymentService;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private HttpServletRequest request;

    @InjectMocks private PaymentController controller;

    // ── listTiers ────────────────────────────────────────────────────────

    @Test
    void listTiers_returnsAllBoostTiers_withAllFields() {
        ResponseEntity<List<Map<String, Object>>> resp = controller.listTiers();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        List<Map<String, Object>> tiers = resp.getBody();
        assertNotNull(tiers);
        assertEquals(BoostTier.values().length, tiers.size());

        for (Map<String, Object> t : tiers) {
            assertNotNull(t.get("code"));
            assertNotNull(t.get("displayName"));
            assertNotNull(t.get("priceVnd"));
            assertNotNull(t.get("durationDays"));
        }
    }

    @Test
    void listTiers_returnsNonEmpty() {
        // Phòng trường hợp enum bị xoá hết — list phải có ≥ 1 tier
        assertFalse(controller.listTiers().getBody().isEmpty());
    }

    // ── boostJob ─────────────────────────────────────────────────────────

    @Test
    void boostJob_validTier_returnsServiceResult() {
        BoostTier tier = BoostTier.values()[0];
        Map<String, Object> serviceResult = Map.of("orderId", 42L, "qrUrl", "https://qr");
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(sepayPaymentService.createBoostOrder(1L, 100L, tier)).thenReturn(serviceResult);

        ResponseEntity<Map<String, Object>> resp = controller.boostJob(100L, tier.name(), request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(serviceResult, resp.getBody());
    }

    @Test
    void boostJob_tierLowercase_isUppercasedBeforeParsing() {
        // Frontend gửi "basic" thay vì "BASIC" — không nên 400 vì style cosmetic
        BoostTier tier = BoostTier.values()[0];
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(sepayPaymentService.createBoostOrder(1L, 100L, tier)).thenReturn(Map.of());

        controller.boostJob(100L, tier.name().toLowerCase(), request);
        // không throw → upper-case parse OK
    }

    @Test
    void boostJob_invalidTier_throws400() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.boostJob(100L, "ULTRA_MEGA", request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertNotNull(ex.getReason());
    }

    @Test
    void boostJob_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.boostJob(100L, "BASIC", request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    // ── orderStatus ──────────────────────────────────────────────────────

    @Test
    void orderStatus_authenticated_passesUserAndOrder_toService() {
        Map<String, Object> serviceResult = Map.of("status", "PAID");
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(5L);
        when(sepayPaymentService.getOrderStatus(5L, 42L)).thenReturn(serviceResult);

        ResponseEntity<Map<String, Object>> resp = controller.orderStatus(42L, request);

        assertSame(serviceResult, resp.getBody());
    }

    @Test
    void orderStatus_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.orderStatus(1L, request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}

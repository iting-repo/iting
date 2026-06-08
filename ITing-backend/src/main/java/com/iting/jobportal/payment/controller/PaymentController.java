package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.entity.BoostTier;
import com.iting.jobportal.payment.service.QuotaService;
import com.iting.jobportal.payment.service.SepayPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Payment endpoints for HR / candidate (authenticated).
 *
 * <ul>
 *   <li>GET /api/payments/boost-tiers — list available tiers + prices
 *   <li>POST /api/hr/jobs/{jobId}/boost?tier=X — create boost order
 *   <li>GET /api/me/payment-orders/{id}/status — poll order status (for frontend)
 * </ul>
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

  private final SepayPaymentService sepayPaymentService;
  private final QuotaService quotaService;
  private final JwtTokenUtil jwtTokenUtil;

  /** List boost tiers — public so frontend can render the price card before HR login flow. */
  @GetMapping("/api/payments/boost-tiers")
  public ResponseEntity<List<Map<String, Object>>> listTiers() {
    List<Map<String, Object>> tiers =
        Arrays.stream(BoostTier.values())
            .map(
                t -> {
                  Map<String, Object> m = new LinkedHashMap<>();
                  m.put("code", t.name());
                  m.put("displayName", t.getDisplayName());
                  m.put("priceVnd", t.getPriceVnd());
                  m.put("durationDays", t.getDuration().toDays());
                  return m;
                })
            .collect(Collectors.toList());
    return ResponseEntity.ok(tiers);
  }

  /** HR creates a payment order to boost a specific job. */
  @PostMapping("/api/hr/jobs/{jobId}/boost")
  public ResponseEntity<Map<String, Object>> boostJob(
      @PathVariable Long jobId, @RequestParam String tier, HttpServletRequest request) {

    Long hrId = jwtTokenUtil.getUserIdFromHeader(request);
    if (hrId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    }

    BoostTier tierEnum;
    try {
      tierEnum = BoostTier.valueOf(tier.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tier không hợp lệ: " + tier);
    }

    return ResponseEntity.ok(sepayPaymentService.createBoostOrder(hrId, jobId, tierEnum));
  }

  /** HR boost job MIỄN PHÍ bằng quota gói (không thanh toán). 402 nếu hết quota. */
  @PostMapping("/api/hr/jobs/{jobId}/boost-quota")
  public ResponseEntity<Map<String, Object>> boostJobWithQuota(
      @PathVariable Long jobId, HttpServletRequest request) {
    Long hrId = jwtTokenUtil.getUserIdFromHeader(request);
    if (hrId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    }
    return ResponseEntity.ok(sepayPaymentService.boostJobWithQuota(hrId, jobId));
  }

  /** Số lượt boost đã dùng / hạn mức trong 30 ngày của HR (cho UI hiển thị x/limit). */
  @GetMapping("/api/hr/boost-quota")
  public ResponseEntity<Map<String, Object>> boostQuota(HttpServletRequest request) {
    Long hrId = jwtTokenUtil.getUserIdFromHeader(request);
    if (hrId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    }
    return ResponseEntity.ok(quotaService.getBoostUsage(hrId));
  }

  /** Poll order status — used by frontend after showing QR. */
  @GetMapping("/api/me/payment-orders/{orderId}/status")
  public ResponseEntity<Map<String, Object>> orderStatus(
      @PathVariable Long orderId, HttpServletRequest request) {

    Long userId = jwtTokenUtil.getUserIdFromHeader(request);
    if (userId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    }
    return ResponseEntity.ok(sepayPaymentService.getOrderStatus(userId, orderId));
  }
}

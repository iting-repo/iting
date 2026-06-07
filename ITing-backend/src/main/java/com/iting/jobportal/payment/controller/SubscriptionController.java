package com.iting.jobportal.payment.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.payment.entity.SubscriptionTier;
import com.iting.jobportal.payment.service.SubscriptionPricingService;
import com.iting.jobportal.payment.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class SubscriptionController {

  private final SubscriptionService subscriptionService;
  private final SubscriptionPricingService pricingService;
  private final JwtTokenUtil jwtTokenUtil;

  /** Public tier list with prices + benefits (giá hiệu lực từ DB, chỉ tier active). */
  @GetMapping("/api/payments/subscription-tiers")
  public ResponseEntity<List<Map<String, Object>>> listTiers() {
    return ResponseEntity.ok(
        pricingService.listActive().stream()
            .map(
                t -> {
                  Map<String, Object> m = new LinkedHashMap<>();
                  m.put("code", t.getCode());
                  m.put("displayName", t.getDisplayName());
                  m.put("priceVnd", t.getPriceVnd());
                  m.put("periodDays", (long) t.getPeriodDays());
                  m.put("benefits", t.getBenefits());
                  m.put("credits", t.getCredits());
                  return m;
                })
            .collect(Collectors.toList()));
  }

  /** HR subscribes / renews (creates SEPAY order). */
  @PostMapping("/api/me/subscription/subscribe")
  public ResponseEntity<Map<String, Object>> subscribe(
      @RequestParam String tier,
      @RequestParam(defaultValue = "true") boolean autoRenew,
      HttpServletRequest request) {
    Long userId = requireUser(request);
    SubscriptionTier t;
    try {
      t = SubscriptionTier.valueOf(tier.toUpperCase());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tier không hợp lệ");
    }

    return ResponseEntity.ok(subscriptionService.createSubscriptionOrder(userId, t, autoRenew));
  }

  /** Get current active subscription (if any). */
  @GetMapping("/api/me/subscription")
  public ResponseEntity<Map<String, Object>> getMine(HttpServletRequest request) {
    Long userId = requireUser(request);
    Map<String, Object> m = new LinkedHashMap<>();
    subscriptionService
        .getActiveSubscription(userId)
        .ifPresentOrElse(
            sub -> {
              m.put("active", true);
              m.put("id", sub.getId());
              m.put("tier", sub.getTier().name());
              m.put("tierDisplayName", sub.getTier().getDisplayName());
              m.put("benefits", sub.getTier().getBenefits());
              m.put("startedAt", sub.getStartedAt());
              m.put("expiresAt", sub.getExpiresAt());
              m.put("autoRenew", sub.getAutoRenew());
              m.put("status", sub.getStatus());
            },
            () -> {
              m.put("active", false);
              m.put("tier", "FREE");
            });
    return ResponseEntity.ok(m);
  }

  /** Cancel auto-renew (keeps current period active until expiry). */
  @PostMapping("/api/me/subscription/cancel")
  public ResponseEntity<Map<String, String>> cancel(
      @RequestParam(required = false) String reason, HttpServletRequest request) {
    Long userId = requireUser(request);
    subscriptionService.cancelAutoRenew(userId, reason != null ? reason : "User-initiated cancel");
    return ResponseEntity.ok(
        Map.of("message", "Đã hủy tự động gia hạn. Premium vẫn active cho tới ngày hết hạn."));
  }

  private Long requireUser(HttpServletRequest request) {
    Long id = jwtTokenUtil.getUserIdFromHeader(request);
    if (id == null)
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    return id;
  }
}

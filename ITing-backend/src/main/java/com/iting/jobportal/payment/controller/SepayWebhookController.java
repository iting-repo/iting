package com.iting.jobportal.payment.controller;

import com.iting.jobportal.payment.service.SepayPaymentService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * SEPAY webhook receiver — called by SEPAY's servers when a matching bank transfer is detected.
 *
 * <p>Endpoint MUST be public (no JWT). Authorization is via "Authorization: Apikey XXX" header
 * verified inside {@link SepayPaymentService#handleWebhook}.
 *
 * <p>Configure this URL in SEPAY dashboard at: <code>https://sepay.vn/payment-webhook</code>
 */
@RestController
@RequestMapping("/api/public/payments")
@RequiredArgsConstructor
@Slf4j
public class SepayWebhookController {

  private final SepayPaymentService sepayPaymentService;

  @PostMapping("/sepay-webhook")
  public ResponseEntity<Map<String, Object>> webhook(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestBody Map<String, Object> payload) {

    log.info("[SEPAY-WEBHOOK] received: {}", payload);
    boolean matched = sepayPaymentService.handleWebhook(authHeader, payload);
    return ResponseEntity.ok(Map.of("success", matched));
  }
}

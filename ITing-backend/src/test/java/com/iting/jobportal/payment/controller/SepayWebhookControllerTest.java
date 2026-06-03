package com.iting.jobportal.payment.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.payment.service.SepayPaymentService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class SepayWebhookControllerTest {

  @Mock private SepayPaymentService sepayPaymentService;
  @InjectMocks private SepayWebhookController controller;

  @Test
  void webhook_matched_returnsSuccessTrue() {
    Map<String, Object> payload = Map.of("transferAmount", 100000, "transferType", "in");
    when(sepayPaymentService.handleWebhook("Apikey TOKEN", payload)).thenReturn(true);

    ResponseEntity<Map<String, Object>> resp = controller.webhook("Apikey TOKEN", payload);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertNotNull(resp.getBody());
    assertEquals(true, resp.getBody().get("success"));
    verify(sepayPaymentService).handleWebhook("Apikey TOKEN", payload);
  }

  @Test
  void webhook_notMatched_returnsSuccessFalse() {
    // SEPAY luôn nhận 200 OK kể cả khi không match đơn hàng — tránh
    // SEPAY retry vô tận webhook đã được xử lý.
    Map<String, Object> payload = Map.of("content", "noisy");
    when(sepayPaymentService.handleWebhook(
            org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyMap()))
        .thenReturn(false);

    ResponseEntity<Map<String, Object>> resp = controller.webhook("Apikey X", payload);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(false, resp.getBody().get("success"));
  }

  @Test
  void webhook_missingAuthHeader_stillPassedToService() {
    // Endpoint nhận null Authorization — service verify token bên trong,
    // controller chỉ làm passthrough nên không reject sớm.
    when(sepayPaymentService.handleWebhook(
            org.mockito.ArgumentMatchers.isNull(), org.mockito.ArgumentMatchers.anyMap()))
        .thenReturn(false);

    ResponseEntity<Map<String, Object>> resp = controller.webhook(null, Map.of());

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    verify(sepayPaymentService).handleWebhook(null, Map.of());
  }
}

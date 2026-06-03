package com.iting.jobportal.application.scheduled;

import com.iting.jobportal.application.service.OfferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Quét offer đang SENT có expiresAt < now → chuyển sang EXPIRED + notify cả 2 bên. Chạy mỗi 10
 * phút. Phù hợp với MVP (không cần độ chính xác giây).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OfferExpiryScheduler {

  private final OfferService offerService;

  @Scheduled(fixedDelayString = "PT10M", initialDelayString = "PT1M")
  public void sweepExpired() {
    try {
      int n = offerService.expireOverdueOffers();
      if (n > 0) log.info("OfferExpiryScheduler: expired {} offers", n);
    } catch (Exception e) {
      log.error("OfferExpiryScheduler failed", e);
    }
  }
}

package com.iting.jobportal.job.task;

import com.iting.jobportal.job.repository.JobRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Dọn các job boost đã hết hạn (featuredUntil &lt; now) → bỏ featured để chúng không còn được đẩy lên
 * đầu trang việc làm. Chạy mỗi giờ.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BoostExpiryTask {

  private final JobRepository jobRepository;

  @Scheduled(fixedRate = 3_600_000) // 1 giờ
  public void clearExpiredBoosts() {
    int cleared = jobRepository.clearExpiredBoosts(LocalDateTime.now());
    if (cleared > 0) {
      log.info("[BOOST-EXPIRY] Đã dọn {} job boost hết hạn", cleared);
    }
  }
}

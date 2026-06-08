package com.iting.jobportal.job.task;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tự động chuyển tin tuyển dụng ACTIVE **đã quá hạn nộp** (dueDate &lt; hôm nay) sang EXPIRED.
 *
 * <p>QUAN TRỌNG: chỉ đóng tin có dueDate ĐÃ QUA — KHÔNG đóng theo tuổi createdAt. Tin còn hạn (dueDate
 * tương lai) hoặc không có dueDate luôn được giữ ACTIVE (tránh nuốt nhầm tin còn hiệu lực).
 *
 * <p>Lịch: 03:00 mỗi ngày. {@code jobExpiryDays} đóng vai công tắc bật/tắt: &le;0 → tắt scheduler.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JobExpiryScheduler {

  private final JobRepository jobRepository;
  private final AdminConfigService adminConfigService;

  @Scheduled(cron = "${app.job-expiry.cron:0 0 3 * * *}")
  @Transactional
  public void expireOverdueJobs() {
    SystemConfig cfg;
    try {
      cfg = adminConfigService.getConfig();
    } catch (RuntimeException e) {
      log.warn("[JobExpiry] Không đọc được SystemConfig, bỏ qua: {}", e.getMessage());
      return;
    }
    // jobExpiryDays <= 0 (hoặc null) → tắt auto-expiry.
    if (cfg == null || cfg.getJobExpiryDays() == null || cfg.getJobExpiryDays() <= 0) {
      return;
    }

    // Chỉ đóng tin ĐÃ QUÁ HẠN NỘP (dueDate < hôm nay) — an toàn, không đụng tin còn hạn.
    int expired = jobRepository.expirePastDueJobs(JobStatus.EXPIRED, JobStatus.ACTIVE);
    if (expired > 0) {
      log.info("[JobExpiry] Đã đóng {} tin tuyển dụng quá hạn nộp (dueDate < hôm nay)", expired);
    }
  }
}

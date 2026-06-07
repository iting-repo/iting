package com.iting.jobportal.job.task;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tự động chuyển tin tuyển dụng ACTIVE đã đăng quá {@code jobExpiryDays} ngày sang EXPIRED.
 *
 * <p>Lịch: 03:00 mỗi ngày (giờ server). Ngưỡng số ngày lấy từ {@link SystemConfig}; nếu không có →
 * không đóng tin nào (an toàn).
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
    if (cfg == null || cfg.getJobExpiryDays() == null || cfg.getJobExpiryDays() <= 0) {
      return; // không cấu hình → không đóng tin
    }

    LocalDateTime threshold = LocalDateTime.now().minusDays(cfg.getJobExpiryDays());
    int expired =
        jobRepository.expireJobsPostedBefore(JobStatus.EXPIRED, JobStatus.ACTIVE, threshold);
    if (expired > 0) {
      log.info(
          "[JobExpiry] Đã đóng {} tin tuyển dụng quá {} ngày", expired, cfg.getJobExpiryDays());
    }
  }
}

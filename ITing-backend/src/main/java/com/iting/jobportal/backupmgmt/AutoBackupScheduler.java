package com.iting.jobportal.backupmgmt;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.DayOfWeek;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Sao lưu CSDL tự động theo cấu hình hệ thống ({@link SystemConfig}).
 *
 * <ul>
 *   <li>autoBackup = false → bỏ qua.
 *   <li>backupFrequency = "weekly" → chỉ chạy vào Thứ 2; "daily" → chạy mỗi ngày.
 *   <li>Dọn các bản backup cũ hơn backupRetention ngày.
 * </ul>
 *
 * Lịch: 02:00 mỗi ngày (giờ server).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AutoBackupScheduler {

  private final BackupService backupService;
  private final AdminConfigService adminConfigService;

  @Scheduled(cron = "${app.backup.cron:0 0 2 * * *}")
  public void runScheduledBackup() {
    SystemConfig cfg;
    try {
      cfg = adminConfigService.getConfig();
    } catch (RuntimeException e) {
      log.warn("[AutoBackup] Không đọc được SystemConfig, bỏ qua: {}", e.getMessage());
      return;
    }
    if (cfg == null || !Boolean.TRUE.equals(cfg.getAutoBackup())) {
      return; // không bật sao lưu tự động
    }

    String freq = cfg.getBackupFrequency() != null ? cfg.getBackupFrequency() : "daily";
    if ("weekly".equalsIgnoreCase(freq) && LocalDate.now().getDayOfWeek() != DayOfWeek.MONDAY) {
      return; // weekly: chỉ chạy Thứ 2
    }

    try {
      var result = backupService.createBackup();
      log.info("[AutoBackup] Đã tạo backup tự động: {}", result.dumpFileKey());
    } catch (Exception e) {
      log.error("[AutoBackup] Tạo backup thất bại: {}", e.getMessage(), e);
      return;
    }

    cleanupOldBackups(cfg.getBackupRetention());
  }

  /** Xóa các bản backup cũ hơn {@code retentionDays} ngày (best-effort). */
  private void cleanupOldBackups(Integer retentionDays) {
    if (retentionDays == null || retentionDays <= 0) return;
    Instant threshold = Instant.now().minus(Duration.ofDays(retentionDays));
    try {
      for (BackupService.BackupInfo b : backupService.getBackupHistory()) {
        try {
          Instant created = Instant.parse(b.createdAt());
          if (created.isBefore(threshold)) {
            backupService.deleteBackup(b.name());
            log.info("[AutoBackup] Đã xóa backup cũ: {} ({})", b.name(), b.createdAt());
          }
        } catch (Exception perItem) {
          // createdAt không parse được hoặc xóa lỗi → bỏ qua item này
          log.debug("[AutoBackup] Bỏ qua item khi dọn dẹp: {}", perItem.getMessage());
        }
      }
    } catch (Exception e) {
      log.warn("[AutoBackup] Lỗi khi dọn backup cũ: {}", e.getMessage());
    }
  }
}

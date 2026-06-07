package com.iting.jobportal.admin.task;

import com.iting.jobportal.admin.dto.DashboardStats;
import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.admin.service.AdminDashboardService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.service.EmailService;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Gửi email tổng hợp (digest) cho admin theo cấu hình {@link SystemConfig#getEmailDigest()}.
 *
 * <ul>
 *   <li>"off"/null → không gửi.
 *   <li>"weekly" → chỉ gửi vào Thứ 2.
 *   <li>"daily" → gửi mỗi ngày.
 * </ul>
 *
 * Lịch: 07:00 mỗi ngày (giờ server).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminDigestScheduler {

  private final AdminConfigService adminConfigService;
  private final AdminDashboardService adminDashboardService;
  private final AccountRepository accountRepository;
  private final EmailService emailService;

  @Scheduled(cron = "${app.digest.cron:0 0 7 * * *}")
  public void sendDigest() {
    SystemConfig cfg;
    try {
      cfg = adminConfigService.getConfig();
    } catch (RuntimeException e) {
      log.warn("[Digest] Không đọc được SystemConfig, bỏ qua: {}", e.getMessage());
      return;
    }
    if (cfg == null) return;

    String freq = cfg.getEmailDigest() != null ? cfg.getEmailDigest().trim().toLowerCase() : "off";
    if ("off".equals(freq) || freq.isBlank()) return;
    if ("weekly".equals(freq) && LocalDate.now().getDayOfWeek() != DayOfWeek.MONDAY) return;

    List<Account> admins = accountRepository.findByRole(Role.ADMIN);
    if (admins.isEmpty()) return;

    String body;
    try {
      body = buildBody(adminDashboardService.getDashboardStats());
    } catch (RuntimeException e) {
      log.error("[Digest] Không tạo được nội dung digest: {}", e.getMessage());
      return;
    }

    String subject =
        "[ITing] Báo cáo tổng hợp " + ("weekly".equals(freq) ? "tuần" : "ngày");
    int sent = 0;
    for (Account admin : admins) {
      if (admin.getEmail() == null) continue;
      try {
        emailService.sendEmail(admin.getEmail(), subject, body);
        sent++;
      } catch (Exception e) {
        log.warn("[Digest] Gửi digest tới {} thất bại: {}", admin.getEmail(), e.getMessage());
      }
    }
    log.info("[Digest] Đã gửi digest ({}) tới {}/{} admin", freq, sent, admins.size());
  }

  private String buildBody(DashboardStats s) {
    return "Xin chào Admin,\n\n"
        + "Báo cáo tổng hợp hoạt động hệ thống ITing:\n\n"
        + "• Tổng người dùng:      " + s.getTotalUsers() + "\n"
        + "• Tổng tin tuyển dụng:  " + s.getTotalJobs() + "\n"
        + "• Tổng lượt ứng tuyển:  " + s.getTotalApplications() + "\n"
        + "• Ứng tuyển chờ xử lý:  " + s.getPendingApplications() + "\n\n"
        + "Vui lòng đăng nhập trang quản trị để xem chi tiết.\n\n"
        + "Trân trọng,\nHệ thống ITing.";
  }
}

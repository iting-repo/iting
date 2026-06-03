package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.admin.service.AdminNotificationService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNotificationServiceImpl implements AdminNotificationService {

  private final AdminConfigService adminConfigService;
  private final AccountRepository accountRepository;
  private final EmailService emailService;
  private final NotificationService notificationService;

  @Override
  public void notifyNewCompany(Company company) {
    SystemConfig config = adminConfigService.getConfig();
    if (config.getNotifyNewCompany() != null && config.getNotifyNewCompany()) {
      List<Account> admins = accountRepository.findByRole(Role.ADMIN);

      for (Account admin : admins) {
        // Send Email to Admin's Account
        try {
          String subject = "ITing - Có công ty mới đăng ký cần duyệt: " + company.getName();
          String body =
              "Xin chào Admin,\n\nCông ty "
                  + company.getName()
                  + " vừa mới đăng ký trên hệ thống và đang chờ phê duyệt.\n\n"
                  + "Vui lòng truy cập trang quản trị để kiểm tra chi tiết.";
          emailService.sendEmail(admin.getEmail(), subject, body);
        } catch (Exception e) {
          log.error("Failed to send email to admin: {}", admin.getEmail(), e);
        }

        // In-app Notification for Admin
        try {
          notificationService.createNotification(
              CreateNotificationRequest.builder()
                  .recipientId(admin.getId())
                  .recipientType(RecipientType.ADMIN)
                  .type(NotificationType.ADMIN_COMPANY_REGISTERED)
                  .content(
                      "Có công ty mới đăng ký: "
                          + company.getName()
                          + ". Vui lòng kiểm tra và phê duyệt.")
                  .entityType("COMPANY")
                  .entityId(company.getId())
                  .actionUrl("/admin/companies")
                  .build());
        } catch (Exception e) {
          log.error("Failed to send in-app notification to admin: {}", admin.getId(), e);
        }
      }
    }
  }

  @Override
  public void notifyNewJob(Job job) {
    SystemConfig config = adminConfigService.getConfig();
    if (config.getNotifyNewJob() != null && config.getNotifyNewJob()) {
      List<Account> admins = accountRepository.findByRole(Role.ADMIN);

      for (Account admin : admins) {
        // Send Email to Admin's Account
        try {
          String companyName =
              job.getCompany() != null ? job.getCompany().getName() : "Không xác định";
          String subject = "ITing - Tin tuyển dụng mới chờ duyệt: " + job.getTitle();
          String body =
              "Xin chào Admin,\n\nTin tuyển dụng mới: '"
                  + job.getTitle()
                  + "' từ công ty "
                  + companyName
                  + " vừa được tạo.\n\nVui lòng truy cập trang quản trị để kiểm duyệt.";
          emailService.sendEmail(admin.getEmail(), subject, body);
        } catch (Exception e) {
          log.error("Failed to send job email to admin: {}", admin.getEmail(), e);
        }

        // In-app Notification for Admin
        try {
          notificationService.createNotification(
              CreateNotificationRequest.builder()
                  .recipientId(admin.getId())
                  .recipientType(RecipientType.ADMIN)
                  .type(NotificationType.ADMIN_JOB_CREATED)
                  .content("Tin tuyển dụng mới chờ duyệt: " + job.getTitle())
                  .entityType("JOB")
                  .entityId(job.getId())
                  .actionUrl("/admin/jobs")
                  .build());
        } catch (Exception e) {
          log.error("Failed to send job in-app notification to admin: {}", admin.getId(), e);
        }
      }
    }
  }

  @Override
  public void notifyUserReport(com.iting.jobportal.admin.entity.UserReport report) {
    SystemConfig config = adminConfigService.getConfig();
    if (config.getNotifyUserReport() != null && config.getNotifyUserReport()) {
      List<Account> admins = accountRepository.findByRole(Role.ADMIN);

      for (Account admin : admins) {
        // Send Email to Admin's Account
        try {
          String subject = "ITing - Báo cáo vi phạm mới: " + report.getType();
          String body =
              "Xin chào Admin,\n\nHệ thống vừa nhận được một báo cáo vi phạm mới.\nLý do: "
                  + report.getReason()
                  + "\nMô tả: "
                  + report.getDescription()
                  + "\n\nVui lòng kiểm tra trên trang quản trị.";
          emailService.sendEmail(admin.getEmail(), subject, body);
        } catch (Exception e) {
          log.error("Failed to send report email to admin: {}", admin.getEmail(), e);
        }

        // In-app Notification for Admin
        try {
          notificationService.createNotification(
              CreateNotificationRequest.builder()
                  .recipientId(admin.getId())
                  .recipientType(RecipientType.ADMIN)
                  .type(NotificationType.ADMIN_REPORT_RECEIVED)
                  .content("Báo cáo vi phạm mới: " + report.getType() + " - " + report.getReason())
                  .entityType("REPORT")
                  .entityId(report.getId())
                  .actionUrl("/admin/reports")
                  .build());
        } catch (Exception e) {
          log.error("Failed to send report in-app notification to admin: {}", admin.getId(), e);
        }
      }
    }
  }
}

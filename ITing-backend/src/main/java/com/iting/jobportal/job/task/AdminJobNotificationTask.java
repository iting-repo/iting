package com.iting.jobportal.job.task;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminJobNotificationTask {

    private final JobRepository jobRepository;
    private final AccountRepository accountRepository;
    private final NotificationService notificationService;

    /**
     * Chạy mỗi 3 tiếng để thông báo cho Admin về các Job đang chờ duyệt.
     * 3 giờ = 3 * 60 * 60 * 1000 = 10,800,000 ms
     */
    @Scheduled(fixedRate = 10800000)
    public void notifyAdminPendingJobs() {
        long pendingCount = jobRepository.countByStatus(JobStatus.PENDING);

        if (pendingCount > 0) {
            log.info("[SCHEDULED TASK] Found {} pending jobs. Sending notifications to all admins.", pendingCount);

            List<Account> admins = accountRepository.findByRole(Role.ADMIN);

            for (Account admin : admins) {
                CreateNotificationRequest request = CreateNotificationRequest.builder()
                        .recipientId(admin.getId())
                        .recipientType(RecipientType.ADMIN)
                        .type(NotificationType.SYSTEM)
                        .content("Công việc đang chờ duyệt: Hiện đang có " + pendingCount
                                + " công việc đang chờ bạn kiểm duyệt. Hãy kiểm tra ngay!")
                        .actionUrl("/admin/jobs")
                        .build();

                try {
                    notificationService.createNotification(request);
                } catch (Exception e) {
                    log.error("Failed to send pending job notification to admin {}: {}", admin.getEmail(),
                            e.getMessage());
                }
            }
        } else {
            log.debug("[SCHEDULED TASK] No pending jobs found. Skipping admin notification.");
        }
    }
}

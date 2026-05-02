package com.iting.jobportal.notification.service.impl;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.entity.Notification;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.repository.NotificationRepository;
import com.iting.jobportal.notification.service.NotificationService;
import com.iting.jobportal.notification.service.WebSocketNotificationService;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.common.service.EmailTemplateService;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.EmployerApplicationRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    private final AccountRepository accountRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final ApplyFormRepository applyFormRepository;
    private final EmployerApplicationRepository employerApplicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientId(request.getRecipientId())
                .recipientType(request.getRecipientType())
                .type(request.getType())
                .content(request.getContent())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .actionUrl(request.getActionUrl())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        Long unreadCount = notificationRepository.countUnreadByRecipientIdAndRecipientType(
                saved.getRecipientId(), saved.getRecipientType());
        webSocketNotificationService.sendNotificationToRecipient(saved.getRecipientId(), saved.getRecipientType(),
                response);
        webSocketNotificationService.sendUnreadCount(saved.getRecipientId(), saved.getRecipientType(), unreadCount);

        // Gửi Mail thông báo
        try {
            accountRepository.findById(saved.getRecipientId()).ifPresent(account -> {
                String subject = "[ITing] Thông báo mới";
                String htmlContent = null;
                String actionUrl = "http://localhost:3000" + (saved.getActionUrl() != null ? saved.getActionUrl() : "");

                // Sử dụng template cụ thể dựa vào loại thông báo
                if (saved.getType() == NotificationType.APPLICATION_ACCEPTED
                        || saved.getType() == NotificationType.APPLICATION_REJECTED) {
                    try {
                        ApplyFormSentToJob sent = employerApplicationRepository.findByIdApplyFormId(saved.getEntityId())
                                .orElseThrow(() -> new RuntimeException("ApplyFormSentToJob not found"));
                        Job job = jobRepository.findById(sent.getId().getJobId())
                                .orElseThrow(() -> new RuntimeException("Job not found"));

                        ApplyForm form = applyFormRepository.findById(sent.getId().getApplyFormId())
                                .orElseThrow(() -> new RuntimeException("ApplyForm not found"));

                        User user = userRepository.findById(form.getUserId())
                                .orElseThrow(() -> new RuntimeException("User profile not found"));

                        if (saved.getType() == NotificationType.APPLICATION_ACCEPTED) {
                            subject = "[ITing] Chúc mừng! Hồ sơ của bạn đã được chấp nhận";
                            htmlContent = emailTemplateService.getApplicationAcceptedTemplate(
                                    user.getFullName(), job.getTitle(), job.getCompany().getName(), actionUrl);
                        } else {
                            subject = "[ITing] Cập nhật về hồ sơ ứng tuyển của bạn";
                            htmlContent = emailTemplateService.getApplicationRejectedTemplate(
                                    user.getFullName(), job.getTitle(), job.getCompany().getName(), null);
                        }
                    } catch (Exception e) {
                        log.warn("Could not load details for application template, falling back to generic: {}",
                                e.getMessage());
                    }
                }

                if (htmlContent != null) {
                    emailService.sendHtmlEmail(account.getEmail(), subject, htmlContent);
                } else {
                    // Fallback to generic template/text
                    String body = String.format(
                            "Chào bạn,\n\n" +
                                    "Bạn có một thông báo mới từ hệ thống ITing Job Portal:\n\n" +
                                    "\"%s\"\n\n" +
                                    "Bạn có thể xem chi tiết tại: %s\n\n" +
                                    "Trân trọng,\n" +
                                    "Đội ngũ ITing.",
                            saved.getContent(),
                            actionUrl);
                    emailService.sendEmail(account.getEmail(), subject, body);
                }
            });
        } catch (Exception e) {
            log.error("Failed to send notification email: {}", e.getMessage());
        }

        return response;
    }

    @Override
    public Page<NotificationResponse> getNotifications(Long recipientId, RecipientType recipientType, int page,
            int size) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0 || size > 100) ? 20 : size;
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "time"));

        return notificationRepository.findByRecipientIdAndRecipientType(recipientId, recipientType, pageable)
                .map(this::toResponse);
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(Long recipientId, RecipientType recipientType) {
        return notificationRepository.findUnreadByRecipientIdAndRecipientType(recipientId, recipientType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Long getUnreadCount(Long recipientId, RecipientType recipientType) {
        return notificationRepository.countUnreadByRecipientIdAndRecipientType(recipientId, recipientType);
    }

    @Override
    public Page<NotificationResponse> getNotificationsByType(Long recipientId, RecipientType recipientType,
            NotificationType type, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0 || size > 100) ? 20 : size;
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "time"));

        return notificationRepository
                .findByRecipientIdAndRecipientTypeAndType(recipientId, recipientType, type, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public void markAsRead(Integer notificationId, Long recipientId, RecipientType recipientType) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientId().equals(recipientId) || notification.getRecipientType() != recipientType) {
            throw new RuntimeException("Unauthorized to update this notification");
        }

        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notificationRepository.markAsRead(notificationId, LocalDateTime.now());
            Long unreadCount = notificationRepository.countUnreadByRecipientIdAndRecipientType(recipientId,
                    recipientType);
            webSocketNotificationService.sendUnreadCount(recipientId, recipientType, unreadCount);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long recipientId, RecipientType recipientType) {
        notificationRepository.markAllAsReadForRecipient(recipientId, recipientType, LocalDateTime.now());
        webSocketNotificationService.sendUnreadCount(recipientId, recipientType, 0L);
    }

    @Override
    @Transactional
    public void deleteNotification(Integer notificationId, Long recipientId, RecipientType recipientType) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientId().equals(recipientId) || notification.getRecipientType() != recipientType) {
            throw new RuntimeException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
        Long unreadCount = notificationRepository.countUnreadByRecipientIdAndRecipientType(recipientId, recipientType);
        webSocketNotificationService.sendUnreadCount(recipientId, recipientType, unreadCount);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipientId())
                .recipientType(notification.getRecipientType())
                .type(notification.getType())
                .content(notification.getContent())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .entityType(notification.getEntityType())
                .entityId(notification.getEntityId())
                .actionUrl(notification.getActionUrl())
                .time(notification.getTime())
                .build();
    }
}

package com.iting.jobportal.notification.service.impl;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.entity.Notification;
import com.iting.jobportal.notification.entity.NotificationPreference;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.repository.NotificationPreferenceRepository;
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
import java.time.LocalTime;
import java.util.List;
import java.util.function.Function;
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
    private final NotificationPreferenceRepository preferenceRepository;

    @Override
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        // ── Enforce notification preferences (chỉ áp dụng cho USER recipient) ──
        // Admin/Company không có preference → luôn nhận.
        NotificationPreference pref = (request.getRecipientType() == RecipientType.USER)
                ? preferenceRepository.findById(request.getRecipientId()).orElse(null)
                : null;

        if (pref != null && !isCategoryEnabled(pref, request.getType())) {
            log.debug("Skip notification {} for user {}: category disabled in preferences",
                    request.getType(), request.getRecipientId());
            return blockedResponse(request);
        }

        // Quiet hours đang bật → vẫn lưu inbox để user xem sau, chỉ bỏ side-effects.
        boolean quiet = pref != null && isWithinQuietHours(pref, LocalTime.now());
        boolean emailAllowed = pref == null || (Boolean.TRUE.equals(pref.getEmailEnabled()) && !quiet);
        boolean pushAllowed  = pref == null || (Boolean.TRUE.equals(pref.getPushEnabled())  && !quiet);

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

        // Push qua WebSocket (toast realtime) — chỉ khi pushEnabled và không trong quiet hours
        if (pushAllowed) {
            webSocketNotificationService.sendNotificationToRecipient(saved.getRecipientId(), saved.getRecipientType(),
                    response);
        }
        // Unread badge vẫn cập nhật (không phá UX — user vẫn cần biết có thông báo mới khi mở app)
        webSocketNotificationService.sendUnreadCount(saved.getRecipientId(), saved.getRecipientType(), unreadCount);

        // Gửi Mail thông báo — chỉ khi emailEnabled và không trong quiet hours
        if (emailAllowed) {
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
                                        (user.getAccount() != null ? user.getAccount().getFullName() : null), job.getTitle(), job.getCompany().getName(), actionUrl);
                            } else {
                                subject = "[ITing] Cập nhật về hồ sơ ứng tuyển của bạn";
                                htmlContent = emailTemplateService.getApplicationRejectedTemplate(
                                        (user.getAccount() != null ? user.getAccount().getFullName() : null), job.getTitle(), job.getCompany().getName(), null);
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
        }

        return response;
    }

    /**
     * Map NotificationType → flag getter trên NotificationPreference.
     * Trả về true nếu user cho phép category, false nếu tắt.
     * Các loại không map (admin-only) → mặc định true để không miss noti hệ thống.
     */
    private boolean isCategoryEnabled(NotificationPreference pref, NotificationType type) {
        Function<NotificationPreference, Boolean> getter = switch (type) {
            case JOB_NEW, JOB_MATCH, JOB_EXPIRING_SOON, JOB_EXPIRED ->
                    NotificationPreference::getJobAlerts;
            case APPLICATION_VIEWED, APPLICATION_ACCEPTED, APPLICATION_REJECTED, APPLICATION_STATUS_CHANGED ->
                    NotificationPreference::getApplicationUpdates;
            case MESSAGE_NEW ->
                    NotificationPreference::getNewMessages;
            case COMPANY_UPDATE, COMPANY_NEW_JOB ->
                    NotificationPreference::getFollowedCompanies;
            case SYSTEM_ANNOUNCEMENT, SYSTEM, ACCOUNT_UPDATE, COMPANY_SUSPENDED, COMPANY_UNSUSPENDED ->
                    NotificationPreference::getSystemUpdates;
            // Admin-only / Company-only types → không enforce preference (USER không nhận các loại này)
            default -> p -> Boolean.TRUE;
        };
        Boolean enabled = getter.apply(pref);
        return enabled == null || enabled;
    }

    /** Trong khung giờ im lặng? Hỗ trợ khoảng cross-midnight (vd 22:00 → 07:00). */
    private boolean isWithinQuietHours(NotificationPreference pref, LocalTime now) {
        if (!Boolean.TRUE.equals(pref.getQuietHoursEnabled())) return false;
        LocalTime from = pref.getQuietHoursFrom();
        LocalTime to = pref.getQuietHoursTo();
        if (from == null || to == null || from.equals(to)) return false;

        if (from.isBefore(to)) {
            // Khoảng thông thường: vd 13:00 → 14:00
            return !now.isBefore(from) && now.isBefore(to);
        } else {
            // Cross-midnight: vd 22:00 → 07:00
            return !now.isBefore(from) || now.isBefore(to);
        }
    }

    /**
     * Tạo response "blocked" để caller không NPE. id = null cho biết noti không được tạo.
     * Caller có thể check `response.getId() == null` nếu cần phân biệt.
     */
    private NotificationResponse blockedResponse(CreateNotificationRequest request) {
        return NotificationResponse.builder()
                .recipientId(request.getRecipientId())
                .recipientType(request.getRecipientType())
                .type(request.getType())
                .content(request.getContent())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .actionUrl(request.getActionUrl())
                .isRead(false)
                .build();
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

package com.iting.jobportal.notification.service.impl;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.entity.Notification;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.repository.NotificationRepository;
import com.iting.jobportal.notification.service.NotificationService;
import com.iting.jobportal.notification.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
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
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final WebSocketNotificationService webSocketNotificationService;

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
        webSocketNotificationService.sendNotificationToRecipient(saved.getRecipientId(), saved.getRecipientType(), response);
        webSocketNotificationService.sendUnreadCount(saved.getRecipientId(), saved.getRecipientType(), unreadCount);

        return response;
    }

    @Override
    public Page<NotificationResponse> getNotifications(Long recipientId, RecipientType recipientType, int page, int size) {
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
    public Page<NotificationResponse> getNotificationsByType(Long recipientId, RecipientType recipientType, NotificationType type, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0 || size > 100) ? 20 : size;
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "time"));

        return notificationRepository.findByRecipientIdAndRecipientTypeAndType(recipientId, recipientType, type, pageable)
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
            Long unreadCount = notificationRepository.countUnreadByRecipientIdAndRecipientType(recipientId, recipientType);
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

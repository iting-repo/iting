package com.iting.jobportal.messaging.service.event;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DomainNotificationPublisher {

    private final NotificationService notificationService;

    public void notifyUser(Long userId, NotificationType type, String content, String entityType, Long entityId, String actionUrl) {
        notificationService.createNotification(CreateNotificationRequest.builder()
                .recipientId(userId)
                .recipientType(RecipientType.USER)
                .type(type)
                .content(content)
                .entityType(entityType)
                .entityId(entityId)
                .actionUrl(actionUrl)
                .build());
    }

    public void notifyCompany(Long companyId, NotificationType type, String content, String entityType, Long entityId, String actionUrl) {
        notificationService.createNotification(CreateNotificationRequest.builder()
                .recipientId(companyId)
                .recipientType(RecipientType.COMPANY)
                .type(type)
                .content(content)
                .entityType(entityType)
                .entityId(entityId)
                .actionUrl(actionUrl)
                .build());
    }
}

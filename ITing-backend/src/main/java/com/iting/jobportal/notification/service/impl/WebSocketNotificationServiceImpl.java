package com.iting.jobportal.notification.service.impl;

import com.iting.jobportal.messaging.relay.ClusterMessagingTemplate;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebSocketNotificationServiceImpl implements WebSocketNotificationService {

    private final ClusterMessagingTemplate messagingTemplate;

    @Override
    public void sendNotificationToRecipient(Long recipientId, RecipientType recipientType,
            NotificationResponse notification) {
        String destination = buildDestination(recipientId, recipientType, "notifications");
        messagingTemplate.convertAndSend(destination, notification);
    }

    @Override
    public void sendUnreadCount(Long recipientId, RecipientType recipientType, Long unreadCount) {
        String destination = buildDestination(recipientId, recipientType, "notifications/unread-count");
        Map<String, Object> payload = new HashMap<>();
        payload.put("recipientId", recipientId);
        payload.put("recipientType", recipientType.name());
        payload.put("unreadCount", unreadCount);
        messagingTemplate.convertAndSend(destination, payload);
    }

    private String buildDestination(Long recipientId, RecipientType recipientType, String channel) {
        return "/topic/" + recipientType.name().toLowerCase() + "/" + recipientId + "/" + channel;
    }
}

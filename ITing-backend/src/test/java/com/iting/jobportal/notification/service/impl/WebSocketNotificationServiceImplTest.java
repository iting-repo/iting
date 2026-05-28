package com.iting.jobportal.notification.service.impl;

import com.iting.jobportal.messaging.relay.ClusterMessagingTemplate;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.enums.RecipientType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WebSocketNotificationServiceImplTest {

    @Mock private ClusterMessagingTemplate messagingTemplate;
    @InjectMocks private WebSocketNotificationServiceImpl service;

    @Test
    void sendNotificationToRecipient_user_buildsTopic() {
        NotificationResponse n = NotificationResponse.builder().id(1).build();

        service.sendNotificationToRecipient(42L, RecipientType.USER, n);

        verify(messagingTemplate).convertAndSend(
                "/topic/user/42/notifications", n);
    }

    @Test
    void sendNotificationToRecipient_company_buildsTopic() {
        NotificationResponse n = NotificationResponse.builder().id(2).build();

        service.sendNotificationToRecipient(7L, RecipientType.COMPANY, n);

        verify(messagingTemplate).convertAndSend(
                "/topic/company/7/notifications", n);
    }

    @Test
    void sendNotificationToRecipient_admin_buildsTopic() {
        NotificationResponse n = NotificationResponse.builder().id(3).build();

        service.sendNotificationToRecipient(1L, RecipientType.ADMIN, n);

        verify(messagingTemplate).convertAndSend(
                "/topic/admin/1/notifications", n);
    }

    @Test
    void sendUnreadCount_user_payloadIncludesAll() {
        service.sendUnreadCount(42L, RecipientType.USER, 5L);

        ArgumentCaptor<String> dest = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Object> payload = ArgumentCaptor.forClass(Object.class);
        verify(messagingTemplate).convertAndSend(dest.capture(), payload.capture());

        assertEquals("/topic/user/42/notifications/unread-count", dest.getValue());
        @SuppressWarnings("unchecked")
        Map<String, Object> p = (Map<String, Object>) payload.getValue();
        assertEquals(42L, p.get("recipientId"));
        assertEquals("USER", p.get("recipientType"));
        assertEquals(5L, p.get("unreadCount"));
    }

    @Test
    void sendUnreadCount_company_payloadCorrect() {
        service.sendUnreadCount(7L, RecipientType.COMPANY, 0L);

        ArgumentCaptor<String> dest = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Object> payload = ArgumentCaptor.forClass(Object.class);
        verify(messagingTemplate).convertAndSend(dest.capture(), payload.capture());

        assertEquals("/topic/company/7/notifications/unread-count", dest.getValue());
        @SuppressWarnings("unchecked")
        Map<String, Object> p = (Map<String, Object>) payload.getValue();
        assertEquals(0L, p.get("unreadCount"));
        assertEquals("COMPANY", p.get("recipientType"));
    }
}

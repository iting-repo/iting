package com.iting.jobportal.notification.service;

import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.impl.WebSocketNotificationServiceImpl;
import com.iting.jobportal.notification.service.WebSocketNotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WebSocketNotificationServiceImplTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private WebSocketNotificationServiceImpl wsNotificationService;

    @Nested
    @DisplayName("sendNotificationToRecipient tests")
    class SendNotificationTests {

        @Test
        @DisplayName("Should send to correct destination for USER recipient")
        void sendNotificationToRecipient_user_sendsToCorrectDestination() {
            NotificationResponse notification = NotificationResponse.builder()
                    .id(1)
                    .recipientId(1L)
                    .recipientType(RecipientType.USER)
                    .type(NotificationType.MESSAGE_NEW)
                    .content("Test notification")
                    .isRead(false)
                    .time(LocalDateTime.now())
                    .build();

            wsNotificationService.sendNotificationToRecipient(1L, RecipientType.USER, notification);

            verify(messagingTemplate).convertAndSend(eq("/topic/user/1/notifications"), eq(notification));
        }

        @Test
        @DisplayName("Should send to correct destination for COMPANY recipient")
        void sendNotificationToRecipient_company_sendsToCorrectDestination() {
            NotificationResponse notification = NotificationResponse.builder()
                    .id(2)
                    .recipientId(2L)
                    .recipientType(RecipientType.COMPANY)
                    .type(NotificationType.JOB_NEW)
                    .content("New job posted")
                    .isRead(false)
                    .time(LocalDateTime.now())
                    .build();

            wsNotificationService.sendNotificationToRecipient(2L, RecipientType.COMPANY, notification);

            verify(messagingTemplate).convertAndSend(eq("/topic/company/2/notifications"), eq(notification));
        }

        @Test
        @DisplayName("Should send to correct destination for ADMIN recipient")
        void sendNotificationToRecipient_admin_sendsToCorrectDestination() {
            NotificationResponse notification = NotificationResponse.builder()
                    .id(3)
                    .recipientId(1L)
                    .recipientType(RecipientType.ADMIN)
                    .type(NotificationType.SYSTEM_ANNOUNCEMENT)
                    .content("System announcement")
                    .isRead(false)
                    .time(LocalDateTime.now())
                    .build();

            wsNotificationService.sendNotificationToRecipient(1L, RecipientType.ADMIN, notification);

            verify(messagingTemplate).convertAndSend(eq("/topic/admin/1/notifications"), eq(notification));
        }

        @Test
        @DisplayName("Should include full notification payload")
        void sendNotificationToRecipient_includesFullPayload() {
            NotificationResponse notification = NotificationResponse.builder()
                    .id(1)
                    .recipientId(1L)
                    .recipientType(RecipientType.USER)
                    .type(NotificationType.APPLICATION_ACCEPTED)
                    .content("Your application was accepted!")
                    .isRead(false)
                    .entityType("APPLICATION")
                    .entityId(100L)
                    .actionUrl("/applications/100")
                    .time(LocalDateTime.of(2026, 3, 22, 10, 30))
                    .build();

            ArgumentCaptor<NotificationResponse> captor = ArgumentCaptor.forClass(NotificationResponse.class);
            wsNotificationService.sendNotificationToRecipient(1L, RecipientType.USER, notification);

            verify(messagingTemplate).convertAndSend(any(String.class), captor.capture());
            NotificationResponse sent = captor.getValue();
            assertEquals(1, sent.getId());
            assertEquals("Your application was accepted!", sent.getContent());
            assertEquals(NotificationType.APPLICATION_ACCEPTED, sent.getType());
            assertEquals(100L, sent.getEntityId());
        }
    }

    @Nested
    @DisplayName("sendUnreadCount tests")
    class SendUnreadCountTests {

        @Test
        @DisplayName("Should send unread count to correct destination for USER")
        void sendUnreadCount_user_sendsCorrectPayload() {
            wsNotificationService.sendUnreadCount(1L, RecipientType.USER, 5L);

            ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
            verify(messagingTemplate).convertAndSend(eq("/topic/user/1/notifications/unread-count"), payloadCaptor.capture());

            Map<String, Object> payload = payloadCaptor.getValue();
            assertEquals(1L, payload.get("recipientId"));
            assertEquals("USER", payload.get("recipientType"));
            assertEquals(5L, payload.get("unreadCount"));
        }

        @Test
        @DisplayName("Should send unread count to correct destination for COMPANY")
        void sendUnreadCount_company_sendsCorrectPayload() {
            wsNotificationService.sendUnreadCount(2L, RecipientType.COMPANY, 10L);

            ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
            verify(messagingTemplate).convertAndSend(eq("/topic/company/2/notifications/unread-count"), payloadCaptor.capture());

            Map<String, Object> payload = payloadCaptor.getValue();
            assertEquals(2L, payload.get("recipientId"));
            assertEquals("COMPANY", payload.get("recipientType"));
            assertEquals(10L, payload.get("unreadCount"));
        }

        @Test
        @DisplayName("Should send zero unread count")
        void sendUnreadCount_zero_sendsZeroCount() {
            wsNotificationService.sendUnreadCount(1L, RecipientType.USER, 0L);

            ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
            verify(messagingTemplate).convertAndSend(any(String.class), payloadCaptor.capture());

            assertEquals(0L, payloadCaptor.getValue().get("unreadCount"));
        }

        @Test
        @DisplayName("Should send large unread count")
        void sendUnreadCount_largeNumber_sendsCorrectly() {
            wsNotificationService.sendUnreadCount(1L, RecipientType.USER, 9999L);

            ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
            verify(messagingTemplate).convertAndSend(any(String.class), payloadCaptor.capture());

            assertEquals(9999L, payloadCaptor.getValue().get("unreadCount"));
        }
    }

}

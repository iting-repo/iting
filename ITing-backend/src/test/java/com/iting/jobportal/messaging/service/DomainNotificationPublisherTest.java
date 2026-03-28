package com.iting.jobportal.messaging.service;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import com.iting.jobportal.messaging.service.event.DomainNotificationPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DomainNotificationPublisherTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private DomainNotificationPublisher publisher;

    @Nested
    @DisplayName("notifyUser tests")
    class NotifyUserTests {

        @Test
        @DisplayName("Should create notification with correct USER recipient type")
        void notifyUser_correctRecipientType() {
            when(notificationService.createNotification(any())).thenReturn(null);

            publisher.notifyUser(1L, NotificationType.MESSAGE_NEW, "Hello!", "CONVERSATION", 5L, "/messages");

            ArgumentCaptor<CreateNotificationRequest> captor = ArgumentCaptor.forClass(CreateNotificationRequest.class);
            verify(notificationService).createNotification(captor.capture());

            CreateNotificationRequest req = captor.getValue();
            assertEquals(1L, req.getRecipientId());
            assertEquals(RecipientType.USER, req.getRecipientType());
            assertEquals(NotificationType.MESSAGE_NEW, req.getType());
            assertEquals("Hello!", req.getContent());
            assertEquals("CONVERSATION", req.getEntityType());
            assertEquals(5L, req.getEntityId());
            assertEquals("/messages", req.getActionUrl());
        }

        @Test
        @DisplayName("Should delegate to notificationService")
        void notifyUser_delegatesToService() {
            publisher.notifyUser(42L, NotificationType.JOB_NEW, "New job posted", "JOB", 100L, "/jobs/100");

            verify(notificationService).createNotification(any(CreateNotificationRequest.class));
        }

        @Test
        @DisplayName("Should support all notification types")
        void notifyUser_allNotificationTypes() {
            for (NotificationType type : NotificationType.values()) {
                reset(notificationService);
                when(notificationService.createNotification(any())).thenReturn(null);

                publisher.notifyUser(1L, type, "Test", "TEST", 1L, "/test");

                ArgumentCaptor<CreateNotificationRequest> captor = ArgumentCaptor.forClass(CreateNotificationRequest.class);
                verify(notificationService).createNotification(captor.capture());
                assertEquals(type, captor.getValue().getType());
            }
        }

        @Test
        @DisplayName("Should pass null actionUrl when not provided")
        void notifyUser_nullActionUrl() {
            when(notificationService.createNotification(any())).thenReturn(null);

            publisher.notifyUser(1L, NotificationType.SYSTEM, "System message", "SYSTEM", null, null);

            ArgumentCaptor<CreateNotificationRequest> captor = ArgumentCaptor.forClass(CreateNotificationRequest.class);
            verify(notificationService).createNotification(captor.capture());

            assertNull(captor.getValue().getActionUrl());
            assertNull(captor.getValue().getEntityId());
        }
    }

    @Nested
    @DisplayName("notifyCompany tests")
    class NotifyCompanyTests {

        @Test
        @DisplayName("Should create notification with correct COMPANY recipient type")
        void notifyCompany_correctRecipientType() {
            when(notificationService.createNotification(any())).thenReturn(null);

            publisher.notifyCompany(2L, NotificationType.MESSAGE_NEW, "You have a new message", "CONVERSATION", 3L, "/messages");

            ArgumentCaptor<CreateNotificationRequest> captor = ArgumentCaptor.forClass(CreateNotificationRequest.class);
            verify(notificationService).createNotification(captor.capture());

            CreateNotificationRequest req = captor.getValue();
            assertEquals(2L, req.getRecipientId());
            assertEquals(RecipientType.COMPANY, req.getRecipientType());
            assertEquals(NotificationType.MESSAGE_NEW, req.getType());
            assertEquals("You have a new message", req.getContent());
        }

        @Test
        @DisplayName("Should delegate to notificationService")
        void notifyCompany_delegatesToService() {
            publisher.notifyCompany(99L, NotificationType.JOB_NEW, "New job", "JOB", 1L, "/jobs");

            verify(notificationService).createNotification(any(CreateNotificationRequest.class));
        }

        @Test
        @DisplayName("Should support all notification types for company")
        void notifyCompany_allNotificationTypes() {
            for (NotificationType type : NotificationType.values()) {
                reset(notificationService);
                when(notificationService.createNotification(any())).thenReturn(null);

                publisher.notifyCompany(1L, type, "Test", "TEST", 1L, "/test");

                ArgumentCaptor<CreateNotificationRequest> captor = ArgumentCaptor.forClass(CreateNotificationRequest.class);
                verify(notificationService).createNotification(captor.capture());
                assertEquals(RecipientType.COMPANY, captor.getValue().getRecipientType());
                assertEquals(type, captor.getValue().getType());
            }
        }
    }
}

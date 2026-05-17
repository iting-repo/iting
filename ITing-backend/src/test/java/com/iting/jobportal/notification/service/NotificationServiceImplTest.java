package com.iting.jobportal.notification.service;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.entity.Notification;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.repository.NotificationRepository;
import com.iting.jobportal.notification.service.impl.NotificationServiceImpl;
import com.iting.jobportal.notification.service.WebSocketNotificationService;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.common.service.EmailTemplateService;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.EmployerApplicationRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private ApplyFormRepository applyFormRepository;

    @Mock
    private EmployerApplicationRepository employerApplicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Notification testNotification;
    private CreateNotificationRequest createRequest;

    @BeforeEach
    void setUp() {
        testNotification = Notification.builder()
                .id(1)
                .recipientId(1L)
                .recipientType(RecipientType.USER)
                .type(NotificationType.MESSAGE_NEW)
                .content("You have a new message")
                .entityType("CONVERSATION")
                .entityId(1L)
                .actionUrl("/messages?conversationId=1")
                .isRead(false)
                .time(LocalDateTime.now())
                .build();

        createRequest = CreateNotificationRequest.builder()
                .recipientId(1L)
                .recipientType(RecipientType.USER)
                .type(NotificationType.MESSAGE_NEW)
                .content("You have a new message")
                .entityType("CONVERSATION")
                .entityId(1L)
                .actionUrl("/messages?conversationId=1")
                .build();
    }

    @Nested
    @DisplayName("createNotification tests")
    class CreateNotificationTests {

        @BeforeEach
        void setUpCreate() {
            when(accountRepository.findById(anyLong())).thenReturn(Optional.empty());
        }

        @Test
        @DisplayName("Should create notification and send via WebSocket")
        void createNotification_success_sendsWebSocketNotification() {
            when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
                Notification n = inv.getArgument(0);
                n.setId(1);
                n.setTime(LocalDateTime.now());
                return n;
            });
            when(notificationRepository.countUnreadByRecipientIdAndRecipientType(1L, RecipientType.USER))
                    .thenReturn(1L);

            NotificationResponse response = notificationService.createNotification(createRequest);

            assertNotNull(response);
            assertEquals(1L, response.getRecipientId());
            assertEquals(RecipientType.USER, response.getRecipientType());
            assertEquals(NotificationType.MESSAGE_NEW, response.getType());
            assertEquals("You have a new message", response.getContent());

            verify(webSocketNotificationService).sendNotificationToRecipient(eq(1L), eq(RecipientType.USER), any(NotificationResponse.class));
            verify(webSocketNotificationService).sendUnreadCount(1L, RecipientType.USER, 1L);
        }

        @Test
        @DisplayName("Should set isRead to false by default")
        void createNotification_setsIsReadFalse() {
            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            when(notificationRepository.save(captor.capture())).thenAnswer(inv -> {
                Notification n = inv.getArgument(0);
                n.setId(1);
                return n;
            });
            when(notificationRepository.countUnreadByRecipientIdAndRecipientType(anyLong(), any())).thenReturn(0L);

            notificationService.createNotification(createRequest);

            assertFalse(captor.getValue().getIsRead());
        }

        @Test
        @DisplayName("Should create notification for company recipient")
        void createNotification_companyRecipient_success() {
            createRequest.setRecipientType(RecipientType.COMPANY);
            createRequest.setRecipientId(2L);

            when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
                Notification n = inv.getArgument(0);
                n.setId(2);
                n.setTime(LocalDateTime.now());
                return n;
            });
            when(notificationRepository.countUnreadByRecipientIdAndRecipientType(2L, RecipientType.COMPANY))
                    .thenReturn(1L);

            NotificationResponse response = notificationService.createNotification(createRequest);

            assertEquals(RecipientType.COMPANY, response.getRecipientType());
            assertEquals(2L, response.getRecipientId());
            verify(webSocketNotificationService).sendNotificationToRecipient(eq(2L), eq(RecipientType.COMPANY), any());
        }

        @Test
        @DisplayName("Should support all notification types")
        void createNotification_allTypes_success() {
            for (NotificationType type : NotificationType.values()) {
                CreateNotificationRequest req = CreateNotificationRequest.builder()
                        .recipientId(1L)
                        .recipientType(RecipientType.USER)
                        .type(type)
                        .content("Test " + type.name())
                        .build();

                when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
                    Notification n = inv.getArgument(0);
                    n.setId(1);
                    n.setTime(LocalDateTime.now());
                    return n;
                });
                when(notificationRepository.countUnreadByRecipientIdAndRecipientType(anyLong(), any())).thenReturn(0L);

                NotificationResponse response = notificationService.createNotification(req);

                assertEquals(type, response.getType());
            }
        }
    }

    @Nested
    @DisplayName("getNotifications tests")
    class GetNotificationsTests {

        @Test
        @DisplayName("Should return paginated notifications")
        void getNotifications_returnsPaginated() {
            Page<Notification> page = new PageImpl<>(List.of(testNotification));
            when(notificationRepository.findByRecipientIdAndRecipientType(eq(1L), eq(RecipientType.USER), any(Pageable.class)))
                    .thenReturn(page);

            Page<NotificationResponse> result = notificationService.getNotifications(1L, RecipientType.USER, 0, 20);

            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            assertEquals("You have a new message", result.getContent().get(0).getContent());
        }

        @Test
        @DisplayName("Should use safe defaults for negative page")
        void getNotifications_negativePage_usesZero() {
            Page<Notification> emptyPage = Page.empty();
            when(notificationRepository.findByRecipientIdAndRecipientType(eq(1L), eq(RecipientType.USER), any(Pageable.class)))
                    .thenReturn(emptyPage);

            notificationService.getNotifications(1L, RecipientType.USER, -5, 20);

            verify(notificationRepository).findByRecipientIdAndRecipientType(eq(1L), eq(RecipientType.USER), any(Pageable.class));
        }

        @Test
        @DisplayName("Should cap size at 100")
        void getNotifications_excessiveSize_capsAt100() {
            Page<Notification> emptyPage = Page.empty();
            when(notificationRepository.findByRecipientIdAndRecipientType(eq(1L), eq(RecipientType.USER), any(Pageable.class)))
                    .thenReturn(emptyPage);

            notificationService.getNotifications(1L, RecipientType.USER, 0, 500);

            verify(notificationRepository).findByRecipientIdAndRecipientType(eq(1L), eq(RecipientType.USER), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("getUnreadNotifications tests")
    class GetUnreadNotificationsTests {

        @Test
        @DisplayName("Should return list of unread notifications")
        void getUnreadNotifications_returnsList() {
            Notification unread1 = Notification.builder()
                    .id(1).recipientId(1L).recipientType(RecipientType.USER)
                    .type(NotificationType.MESSAGE_NEW).content("Unread 1")
                    .isRead(false).time(LocalDateTime.now())
                    .build();
            Notification unread2 = Notification.builder()
                    .id(2).recipientId(1L).recipientType(RecipientType.USER)
                    .type(NotificationType.APPLICATION_ACCEPTED).content("Unread 2")
                    .isRead(false).time(LocalDateTime.now())
                    .build();

            when(notificationRepository.findUnreadByRecipientIdAndRecipientType(1L, RecipientType.USER))
                    .thenReturn(List.of(unread1, unread2));

            List<NotificationResponse> result = notificationService.getUnreadNotifications(1L, RecipientType.USER);

            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("Should return empty list when no unread notifications")
        void getUnreadNotifications_empty_returnsEmptyList() {
            when(notificationRepository.findUnreadByRecipientIdAndRecipientType(1L, RecipientType.USER))
                    .thenReturn(List.of());

            List<NotificationResponse> result = notificationService.getUnreadNotifications(1L, RecipientType.USER);

            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("getUnreadCount tests")
    class GetUnreadCountTests {

        @Test
        @DisplayName("Should return correct unread count")
        void getUnreadCount_returnsCount() {
            when(notificationRepository.countUnreadByRecipientIdAndRecipientType(1L, RecipientType.USER))
                    .thenReturn(10L);

            Long count = notificationService.getUnreadCount(1L, RecipientType.USER);

            assertEquals(10L, count);
        }

        @Test
        @DisplayName("Should return 0 when no unread notifications")
        void getUnreadCount_zero_returnsZero() {
            when(notificationRepository.countUnreadByRecipientIdAndRecipientType(1L, RecipientType.USER))
                    .thenReturn(0L);

            Long count = notificationService.getUnreadCount(1L, RecipientType.USER);

            assertEquals(0L, count);
        }
    }

    @Nested
    @DisplayName("markAsRead tests")
    class MarkAsReadTests {

        @Test
        @DisplayName("Should mark notification as read and update unread count")
        void markAsRead_success_updatesCount() {
            when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));
            when(notificationRepository.countUnreadByRecipientIdAndRecipientType(1L, RecipientType.USER))
                    .thenReturn(0L);

            notificationService.markAsRead(1, 1L, RecipientType.USER);

            verify(notificationRepository).markAsRead(eq(1), any(LocalDateTime.class));
            verify(webSocketNotificationService).sendUnreadCount(1L, RecipientType.USER, 0L);
        }

        @Test
        @DisplayName("Should throw exception when notification not found")
        void markAsRead_notFound_throwsException() {
            when(notificationRepository.findById(999)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notificationService.markAsRead(999, 1L, RecipientType.USER));

            assertEquals("Notification not found", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user is not the recipient")
        void markAsRead_wrongRecipient_throwsException() {
            when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notificationService.markAsRead(1, 999L, RecipientType.USER));

            assertEquals("Unauthorized to update this notification", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when recipientType does not match")
        void markAsRead_wrongRecipientType_throwsException() {
            when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notificationService.markAsRead(1, 1L, RecipientType.COMPANY));

            assertEquals("Unauthorized to update this notification", exception.getMessage());
        }

        @Test
        @DisplayName("Should not update if already read")
        void markAsRead_alreadyRead_skipsUpdate() {
            testNotification.setIsRead(true);
            when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));

            notificationService.markAsRead(1, 1L, RecipientType.USER);

            verify(notificationRepository, never()).markAsRead(anyInt(), any());
            verify(webSocketNotificationService, never()).sendUnreadCount(anyLong(), any(), anyLong());
        }
    }

    @Nested
    @DisplayName("markAllAsRead tests")
    class MarkAllAsReadTests {

        @Test
        @DisplayName("Should mark all as read and send zero count")
        void markAllAsRead_success_sendsZeroCount() {
            notificationService.markAllAsRead(1L, RecipientType.USER);

            verify(notificationRepository).markAllAsReadForRecipient(eq(1L), eq(RecipientType.USER), any(LocalDateTime.class));
            verify(webSocketNotificationService).sendUnreadCount(1L, RecipientType.USER, 0L);
        }
    }

    @Nested
    @DisplayName("deleteNotification tests")
    class DeleteNotificationTests {

        @Test
        @DisplayName("Should delete notification and update unread count")
        void deleteNotification_success_deletesAndUpdatesCount() {
            when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));
            when(notificationRepository.countUnreadByRecipientIdAndRecipientType(1L, RecipientType.USER))
                    .thenReturn(0L);

            notificationService.deleteNotification(1, 1L, RecipientType.USER);

            verify(notificationRepository).delete(testNotification);
            verify(webSocketNotificationService).sendUnreadCount(1L, RecipientType.USER, 0L);
        }

        @Test
        @DisplayName("Should throw exception when notification not found")
        void deleteNotification_notFound_throwsException() {
            when(notificationRepository.findById(999)).thenReturn(Optional.empty());

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notificationService.deleteNotification(999, 1L, RecipientType.USER));

            assertEquals("Notification not found", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user is not the recipient")
        void deleteNotification_wrongRecipient_throwsException() {
            when(notificationRepository.findById(1)).thenReturn(Optional.of(testNotification));

            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notificationService.deleteNotification(1, 999L, RecipientType.USER));

            assertEquals("Unauthorized to delete this notification", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("getNotificationsByType tests")
    class GetByTypeTests {

        @Test
        @DisplayName("Should return notifications filtered by type")
        void getNotificationsByType_returnsFiltered() {
            Page<Notification> page = new PageImpl<>(List.of(testNotification));
            when(notificationRepository.findByRecipientIdAndRecipientTypeAndType(
                    eq(1L), eq(RecipientType.USER), eq(NotificationType.MESSAGE_NEW), any(Pageable.class)))
                    .thenReturn(page);

            Page<NotificationResponse> result = notificationService.getNotificationsByType(
                    1L, RecipientType.USER, NotificationType.MESSAGE_NEW, 0, 20);

            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
            assertEquals(NotificationType.MESSAGE_NEW, result.getContent().get(0).getType());
        }
    }

}

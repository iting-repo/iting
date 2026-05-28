package com.iting.jobportal.notification.service;

import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import java.util.List;
import org.springframework.data.domain.Page;

public interface NotificationService {

  NotificationResponse createNotification(CreateNotificationRequest request);

  Page<NotificationResponse> getNotifications(
      Long recipientId, RecipientType recipientType, int page, int size);

  List<NotificationResponse> getUnreadNotifications(Long recipientId, RecipientType recipientType);

  Long getUnreadCount(Long recipientId, RecipientType recipientType);

  Page<NotificationResponse> getNotificationsByType(
      Long recipientId, RecipientType recipientType, NotificationType type, int page, int size);

  void markAsRead(Integer notificationId, Long recipientId, RecipientType recipientType);

  void markAllAsRead(Long recipientId, RecipientType recipientType);

  void deleteNotification(Integer notificationId, Long recipientId, RecipientType recipientType);
}

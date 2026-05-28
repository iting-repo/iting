package com.iting.jobportal.notification.service;

import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.enums.RecipientType;

public interface WebSocketNotificationService {

  void sendNotificationToRecipient(
      Long recipientId, RecipientType recipientType, NotificationResponse notification);

  void sendUnreadCount(Long recipientId, RecipientType recipientType, Long unreadCount);
}

package com.iting.jobportal.notification.dto.response;

import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Integer id;
    private Long recipientId;
    private RecipientType recipientType;
    private NotificationType type;
    private String content;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String entityType;
    private Long entityId;
    private String actionUrl;
    private LocalDateTime time;
}

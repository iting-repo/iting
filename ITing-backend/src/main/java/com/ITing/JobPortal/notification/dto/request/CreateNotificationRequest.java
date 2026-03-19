package com.iting.jobportal.notification.dto.request;

import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotNull(message = "Recipient type is required")
    private RecipientType recipientType;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotBlank(message = "Content cannot be empty")
    private String content;

    // Optional fields
    private String entityType;
    private Long entityId;
    private String actionUrl;
}

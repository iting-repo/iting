package com.iting.jobportal.notification.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.dto.response.NotificationResponse;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @Operation(summary = "Create a notification (internal/admin use)")
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @GetMapping
    @Operation(summary = "Get notifications for current user")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @RequestParam(defaultValue = "USER") RecipientType recipientType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) NotificationType type) {
        if (type != null) {
            return ResponseEntity.ok(notificationService.getNotificationsByType(userId, recipientType, type, page, size));
        }
        return ResponseEntity.ok(notificationService.getNotifications(userId, recipientType, page, size));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications for current user")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @RequestParam(defaultValue = "USER") RecipientType recipientType) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId, recipientType));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @RequestParam(defaultValue = "USER") RecipientType recipientType) {
        Long count = notificationService.getUnreadCount(userId, recipientType);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark one notification as read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @PathVariable Integer notificationId,
            @RequestParam(defaultValue = "USER") RecipientType recipientType) {
        notificationService.markAsRead(notificationId, userId, recipientType);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @RequestParam(defaultValue = "USER") RecipientType recipientType) {
        notificationService.markAllAsRead(userId, recipientType);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @Parameter(hidden = true) @CurrentUser Long userId,
            @PathVariable Integer notificationId,
            @RequestParam(defaultValue = "USER") RecipientType recipientType) {
        notificationService.deleteNotification(notificationId, userId, recipientType);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }
}

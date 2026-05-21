package com.iting.jobportal.notification.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.notification.dto.NotificationPreferenceDto;
import com.iting.jobportal.notification.service.NotificationPreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "07.5 Notification Preferences", description = "Cài đặt thông báo của ứng viên")
@RestController
@RequestMapping("/api/candidate/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService service;

    @GetMapping
    @Operation(summary = "Lấy cài đặt thông báo hiện tại (tự tạo default nếu chưa có)")
    public ResponseEntity<NotificationPreferenceDto> get(@CurrentUser Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        return ResponseEntity.ok(service.getOrCreate(userId));
    }

    @PutMapping
    @Operation(summary = "Cập nhật cài đặt thông báo (partial update)")
    public ResponseEntity<NotificationPreferenceDto> update(
            @CurrentUser Long userId,
            @RequestBody NotificationPreferenceDto dto) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        return ResponseEntity.ok(service.update(userId, dto));
    }
}

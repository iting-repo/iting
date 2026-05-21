package com.iting.jobportal.announcement.controller;

import com.iting.jobportal.announcement.dto.AnnouncementDto;
import com.iting.jobportal.announcement.service.SystemAnnouncementService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "13. System Announcements (User)")
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class UserAnnouncementController {

    private final SystemAnnouncementService service;
    private final AccountRepository accountRepository;

    @GetMapping("/active")
    @Operation(summary = "Lấy announcement đang active cho user theo route hiện tại (tối đa 1)")
    public ResponseEntity<List<AnnouncementDto>> getActive(
            @CurrentUser Long userId,
            @RequestParam(name = "route", defaultValue = "/") String route) {
        if (userId == null) return ResponseEntity.ok(List.of());
        String role = accountRepository.findById(userId)
                .map(Account::getRole)
                .map(Enum::name)
                .orElse(null);
        return ResponseEntity.ok(service.getActiveForUser(userId, role, route));
    }

    @PostMapping("/{id}/ack")
    @Operation(summary = "Đánh dấu user đã đọc/đóng announcement — không show lại")
    public ResponseEntity<?> ack(@CurrentUser Long userId, @PathVariable Long id) {
        service.ack(userId, id);
        return ResponseEntity.ok(Map.of("acked", true));
    }
}

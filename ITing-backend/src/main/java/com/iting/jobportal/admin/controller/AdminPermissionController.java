package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.service.AdminPermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
@Tag(name = "15. Admin Permission Management", description = "Per-user permission override management")
public class AdminPermissionController {

    private final AdminPermissionService adminPermissionService;

    @GetMapping("/users/{userId}/overrides")
    @Operation(summary = "Lấy danh sách permission override của người dùng")
    public ResponseEntity<Map<String, Boolean>> getOverrides(@PathVariable Long userId) {
        return ResponseEntity.ok(adminPermissionService.getOverrides(userId));
    }

    @PutMapping("/users/{userId}/overrides")
    @Operation(summary = "Thay thế toàn bộ permission override của người dùng (atomic replace)")
    public ResponseEntity<?> replaceOverrides(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> overrides) {
        Long adminId = 1L;
        adminPermissionService.replaceOverrides(adminId, userId, overrides);
        return ResponseEntity.ok(Map.of("message", "Overrides replaced successfully"));
    }

    @DeleteMapping("/users/{userId}/overrides/{permissionKey}")
    @Operation(summary = "Xóa một permission override cụ thể")
    public ResponseEntity<?> deleteOverride(
            @PathVariable Long userId,
            @PathVariable String permissionKey) {
        Long adminId = 1L;
        adminPermissionService.deleteOverride(adminId, userId, permissionKey);
        return ResponseEntity.ok(Map.of("message", "Override deleted"));
    }

    @DeleteMapping("/users/{userId}/overrides")
    @Operation(summary = "Xóa toàn bộ permission override của người dùng")
    public ResponseEntity<?> clearOverrides(@PathVariable Long userId) {
        Long adminId = 1L;
        adminPermissionService.clearOverrides(adminId, userId);
        return ResponseEntity.ok(Map.of("message", "All overrides cleared"));
    }
}

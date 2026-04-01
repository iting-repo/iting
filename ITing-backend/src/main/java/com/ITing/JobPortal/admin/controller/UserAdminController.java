package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.BanUserRequest;
import com.iting.jobportal.admin.dto.UpdateUserRequest;
import com.iting.jobportal.admin.dto.UserListResponse;
import com.iting.jobportal.admin.service.AdminUserService;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "11. Admin User Management", description = "CRUD operations for users by admin")
public class UserAdminController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Lấy danh sách người dùng")
    public ResponseEntity<Page<UserListResponse>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminUserService.getAllUsers(keyword, role, status, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết người dùng")
    public ResponseEntity<UserListResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin/trạng thái người dùng")
    public ResponseEntity<UserListResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request
    ) {
        Long adminId = 1L; // Mock adminId for now as in other controllers
        return ResponseEntity.ok(adminUserService.updateUser(adminId, id, request));
    }

    @PostMapping("/{id}/ban")
    @Operation(summary = "Cấm người dùng (chuyển sang trạng thái BANNED)")
    public ResponseEntity<?> banUser(
            @PathVariable Long id,
            @RequestBody BanUserRequest request
    ) {
        Long adminId = 1L;
        adminUserService.banUser(adminId, id, request);
        return ResponseEntity.ok(Map.of("message", "User banned successfully"));
    }

    @PostMapping("/{id}/unban")
    @Operation(summary = "Mở cấm người dùng (chuyển sang trạng thái ACTIVE)")
    public ResponseEntity<?> unbanUser(@PathVariable Long id) {
        Long adminId = 1L;
        adminUserService.unbanUser(adminId, id);
        return ResponseEntity.ok(Map.of("message", "User unbanned successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa người dùng (hard delete)")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Long adminId = 1L;
        adminUserService.deleteUser(adminId, id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}

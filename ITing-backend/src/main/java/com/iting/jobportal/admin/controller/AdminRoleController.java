package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.AdminRoleDefinition;
import com.iting.jobportal.admin.repository.AdminRoleDefinitionRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/admin-roles")
@RequiredArgsConstructor
@Tag(name = "16. Admin Role Management", description = "Manage admin role hierarchy (dynamic)")
public class AdminRoleController {

    private final AccountRepository accountRepository;
    private final AdminRoleDefinitionRepository roleDefRepository;

    // ── Admin Account Role Assignment ─────────────────────────────

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả admin accounts với admin role")
    public ResponseEntity<List<Map<String, Object>>> getAdminAccounts() {
        List<Account> admins = accountRepository.findByRole(Role.ADMIN);
        List<Map<String, Object>> result = admins.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("email", a.getEmail());
            map.put("fullName", a.getFullName() != null ? a.getFullName() : a.getEmail());
            map.put("avatarUrl", a.getAvatarUrl() != null ? a.getAvatarUrl() : "");
            map.put("adminRole", a.getAdminRole() != null ? a.getAdminRole() : "VIEWER");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Lấy admin role của một user cụ thể")
    public ResponseEntity<Map<String, Object>> getAdminRole(@PathVariable Long userId) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        Map<String, Object> map = new HashMap<>();
        map.put("userId", account.getId());
        map.put("adminRole", account.getAdminRole() != null ? account.getAdminRole() : "VIEWER");
        return ResponseEntity.ok(map);
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Cập nhật admin role của một user (chỉ Super Admin)")
    public ResponseEntity<?> updateAdminRole(
            @PathVariable Long userId,
            @RequestBody UpdateAdminRoleRequest request) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getRole().normalize() != Role.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is not an admin"));
        }

        // Validate role_key exists in definitions
        String roleKey = request.getAdminRole();
        if (!roleDefRepository.existsByRoleKey(roleKey)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vai trò không tồn tại: " + roleKey));
        }

        account.setAdminRole(roleKey);
        accountRepository.save(account);
        return ResponseEntity.ok(Map.of(
                "message", "Admin role updated successfully",
                "userId", userId,
                "adminRole", roleKey
        ));
    }

    // ── Role Definition CRUD ──────────────────────────────────────

    @GetMapping("/definitions")
    @Operation(summary = "Lấy tất cả role definitions (sắp xếp theo level giảm dần)")
    public ResponseEntity<List<AdminRoleDefinition>> getRoleDefinitions() {
        return ResponseEntity.ok(roleDefRepository.findAllByOrderByLevelDesc());
    }

    @PostMapping("/definitions")
    @Operation(summary = "Tạo vai trò admin mới")
    public ResponseEntity<?> createRoleDefinition(@RequestBody CreateRoleRequest request) {
        if (request.getRoleKey() == null || request.getRoleKey().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "role_key không được để trống"));
        }

        // Normalize key: uppercase, replace spaces with underscore
        String normalizedKey = request.getRoleKey().trim().toUpperCase().replaceAll("\\s+", "_");

        if (roleDefRepository.existsByRoleKey(normalizedKey)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vai trò '" + normalizedKey + "' đã tồn tại"));
        }

        if (request.getLevel() == null || request.getLevel() < 1 || request.getLevel() > 99) {
            return ResponseEntity.badRequest().body(Map.of("error", "Level phải từ 1 đến 99"));
        }

        AdminRoleDefinition def = AdminRoleDefinition.builder()
                .roleKey(normalizedKey)
                .label(request.getLabel() != null ? request.getLabel().trim() : normalizedKey)
                .description(request.getDescription())
                .icon(request.getIcon() != null ? request.getIcon() : "👁️")
                .color(request.getColor() != null ? request.getColor() : "#6B7280")
                .bgLight(request.getBgLight() != null ? request.getBgLight() : "bg-gray-50")
                .level(request.getLevel())
                .isSystem(false) // Custom roles are never system roles
                .build();

        AdminRoleDefinition saved = roleDefRepository.save(def);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/definitions/{id}")
    @Operation(summary = "Cập nhật role definition (không đổi role_key)")
    public ResponseEntity<?> updateRoleDefinition(
            @PathVariable Long id,
            @RequestBody CreateRoleRequest request) {
        AdminRoleDefinition def = roleDefRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role definition not found"));

        if (request.getLabel() != null) def.setLabel(request.getLabel().trim());
        if (request.getDescription() != null) def.setDescription(request.getDescription());
        if (request.getIcon() != null) def.setIcon(request.getIcon());
        if (request.getColor() != null) def.setColor(request.getColor());
        if (request.getBgLight() != null) def.setBgLight(request.getBgLight());
        if (request.getLevel() != null) {
            if (def.getIsSystem()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không thể thay đổi level của vai trò hệ thống"));
            }
            def.setLevel(request.getLevel());
        }

        AdminRoleDefinition saved = roleDefRepository.save(def);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/definitions/{id}")
    @Operation(summary = "Xóa vai trò (chỉ vai trò tùy chỉnh, không phải system)")
    public ResponseEntity<?> deleteRoleDefinition(@PathVariable Long id) {
        AdminRoleDefinition def = roleDefRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role definition not found"));

        if (def.getIsSystem()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa vai trò hệ thống"));
        }

        // Check if any account is using this role
        String roleKey = def.getRoleKey();
        List<Account> usingAccounts = accountRepository.findByRole(Role.ADMIN).stream()
                .filter(a -> roleKey.equals(a.getAdminRole()))
                .toList();

        if (!usingAccounts.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Không thể xóa vai trò đang được " + usingAccounts.size() + " admin sử dụng. Hãy đổi vai trò của họ trước."
            ));
        }

        roleDefRepository.delete(def);
        return ResponseEntity.ok(Map.of("message", "Đã xóa vai trò: " + def.getLabel()));
    }

    // ── Request DTOs ──────────────────────────────────────────────

    @Data
    public static class UpdateAdminRoleRequest {
        private String adminRole;
    }

    @Data
    public static class CreateRoleRequest {
        private String roleKey;
        private String label;
        private String description;
        private String icon;
        private String color;
        private String bgLight;
        private Integer level;
    }
}

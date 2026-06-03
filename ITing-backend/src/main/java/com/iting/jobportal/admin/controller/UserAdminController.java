package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.BanUserRequest;
import com.iting.jobportal.admin.dto.request.UpdateUserRequest;
import com.iting.jobportal.admin.dto.response.UserListResponse;
import com.iting.jobportal.admin.service.AdminUserService;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.messaging.websocket.WebSocketEventListener;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "14. Admin User Management", description = "CRUD operations for users by admin")
public class UserAdminController {

  private final AdminUserService adminUserService;
  private final WebSocketEventListener webSocketEventListener;

  @GetMapping
  @Operation(summary = "Lấy danh sách người dùng")
  public ResponseEntity<Page<UserListResponse>> getAllUsers(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) Role role,
      @RequestParam(required = false) AccountStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
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
      @PathVariable Long id, @RequestBody UpdateUserRequest request) {
    Long adminId = 1L; // Mock adminId for now as in other controllers
    return ResponseEntity.ok(adminUserService.updateUser(adminId, id, request));
  }

  @PostMapping("/{id}/ban")
  @Operation(summary = "Cấm người dùng (chuyển sang trạng thái BANNED)")
  public ResponseEntity<?> banUser(@PathVariable Long id, @RequestBody BanUserRequest request) {
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

  @PostMapping("/bulk-ban")
  @Operation(summary = "Ban nhiều người dùng")
  public ResponseEntity<?> bulkBanUsers(@RequestBody java.util.List<Long> ids) {
    Long adminId = 1L;
    adminUserService.bulkBanUsers(ids, new BanUserRequest());
    return ResponseEntity.ok(Map.of("message", "Users banned successfully"));
  }

  @PostMapping("/bulk-unban")
  @Operation(summary = "Bỏ ban nhiều người dùng")
  public ResponseEntity<?> bulkUnbanUsers(@RequestBody java.util.List<Long> ids) {
    adminUserService.bulkUnbanUsers(ids);
    return ResponseEntity.ok(Map.of("message", "Users unbanned successfully"));
  }

  @PostMapping("/bulk-delete")
  @Operation(summary = "Xóa nhiều người dùng")
  public ResponseEntity<?> bulkDeleteUsers(@RequestBody java.util.List<Long> ids) {
    adminUserService.bulkDeleteUsers(ids);
    return ResponseEntity.ok(Map.of("message", "Users deleted successfully"));
  }

  @GetMapping("/export")
  @Operation(summary = "Xuất danh sách người dùng ra file Excel")
  public ResponseEntity<Resource> exportUsers() {
    String filename = "users.xlsx";
    InputStreamResource file = new InputStreamResource(adminUserService.exportUsersToExcel());

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(file);
  }

  @PostMapping("/import")
  @Operation(summary = "Nhập danh sách người dùng từ file Excel")
  public ResponseEntity<?> importUsers(@RequestParam("file") MultipartFile file) {
    adminUserService.importUsersFromExcel(file);
    return ResponseEntity.ok(Map.of("message", "Users imported successfully"));
  }

  @GetMapping("/template")
  @Operation(summary = "Tải file mẫu Excel để nhập người dùng")
  public ResponseEntity<Resource> getTemplate() {
    String filename = "users_template.xlsx";
    InputStreamResource file = new InputStreamResource(adminUserService.getImportTemplate());

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(file);
  }

  @GetMapping("/online-ids")
  @Operation(summary = "Lấy danh sách ID người dùng đang online")
  public ResponseEntity<Set<Long>> getOnlineUserIds() {
    return ResponseEntity.ok(webSocketEventListener.getOnlineUserIds());
  }
}

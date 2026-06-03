package com.iting.jobportal.user.controller; // Đảm bảo đúng package của bạn

import com.iting.jobportal.user.dto.request.*;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import com.iting.jobportal.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "06. User Profile")
@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  // ✅ Lấy Profile bằng Long ID
  @GetMapping
  public ResponseEntity<UserProfileResponse> getProfile(@CurrentUser Long userId) {
    return ResponseEntity.ok(userService.getProfile(userId));
  }

  // ✅ Cập nhật thông tin cơ bản bằng Long ID
  @PutMapping("/basic")
  public ResponseEntity<?> updateBasic(
      @CurrentUser Long userId, @RequestBody UpdateUserRequest req) {
    userService.updateBasic(userId, req);
    return ResponseEntity.ok(Map.of("message", "Updated"));
  }

  // ✅ Cập nhật Avatar bằng Long ID
  @PutMapping("/avatar")
  public ResponseEntity<?> updateAvatar(
      @CurrentUser Long userId, @RequestBody UpdateAvatarRequest req) {
    userService.updateAvatar(userId, req.getAvatarUrl());
    return ResponseEntity.ok(Map.of("message", "Avatar updated"));
  }

  @PostMapping("/avatar/upload")
  public ResponseEntity<?> uploadAvatar(
      @CurrentUser Long userId, @RequestParam("file") MultipartFile file) {
    String url = userService.uploadAvatar(userId, file);
    return ResponseEntity.ok(Map.of("avatarUrl", url));
  }

  // ✅ Xóa Avatar bằng Long ID
  @DeleteMapping("/avatar")
  public ResponseEntity<?> deleteAvatar(@CurrentUser Long userId) {
    userService.deleteAvatar(userId);
    return ResponseEntity.ok(Map.of("message", "Avatar removed"));
  }

  // ✅ Cập nhật thông tin cá nhân (không cho nhà tuyển dụng xem)
  @PutMapping("/personal")
  public ResponseEntity<?> updatePersonal(
      @CurrentUser Long userId, @Valid @RequestBody PersonalUpdateDto dto) {
    userService.updatePersonal(userId, dto);
    return ResponseEntity.ok(Map.of("message", "Personal information updated"));
  }
}

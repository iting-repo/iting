package com.iting.jobportal.user.controller; // Đảm bảo đúng package của bạn

import com.iting.jobportal.user.controller.CurrentUser;
import com.iting.jobportal.user.dto.*;
import com.iting.jobportal.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

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
    public ResponseEntity<?> updateBasic(@CurrentUser Long userId,
                                         @RequestBody UpdateUserRequest req) {
        userService.updateBasic(userId, req);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    // ✅ Cập nhật Avatar bằng Long ID
    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@CurrentUser Long userId,
                                          @RequestBody UpdateAvatarRequest req) {
        userService.updateAvatar(userId, req.getAvatarUrl());
        return ResponseEntity.ok(Map.of("message", "Avatar updated"));
    }

    @PostMapping("/avatar/upload")
    public ResponseEntity<?> uploadAvatar(@CurrentUser String userId,
                                          @RequestParam("file") MultipartFile file) {
        String url = userService.uploadAvatar(userId, file);
        return ResponseEntity.ok(Map.of("avatarUrl", url));
    }

    // ✅ Xóa Avatar bằng Long ID
    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar(@CurrentUser Long userId) {
        userService.deleteAvatar(userId);
        return ResponseEntity.ok(Map.of("message", "Avatar removed"));
    }

    // ✅ Cập nhật Mô tả bằng Long ID
    @PutMapping("/description")
    public ResponseEntity<?> updateDescription(@CurrentUser Long userId,
                                               @RequestBody UpdateDescriptionRequest req) {
        userService.updateDescription(userId, req.getDescription());
        return ResponseEntity.ok(Map.of("message", "Description updated"));
    }

    // ✅ Cập nhật Địa chỉ bằng Long ID
    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(@CurrentUser Long userId,
                                           @RequestBody UpdateAddressRequest req) {
        userService.updateAddress(userId, req.getAddress());
        return ResponseEntity.ok(Map.of("message", "Address updated"));
    }

    // ✅ Cập nhật Ngày sinh & Giới tính bằng Long ID
    @PutMapping("/birth-gender")
    public ResponseEntity<?> updateBirthGender(@CurrentUser Long userId,
                                               @RequestBody UpdateBirthGenderRequest req) {
        userService.updateBirthGender(userId, req.getBirthDate(), req.getGender());
        return ResponseEntity.ok(Map.of("message", "Birthdate & gender updated"));
    }
}


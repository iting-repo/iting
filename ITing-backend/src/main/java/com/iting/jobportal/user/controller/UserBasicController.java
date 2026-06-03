package com.iting.jobportal.user.controller;

import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.service.UserService;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "07. User Basic Profile")
@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
public class UserBasicController {

  private final UserService userService;
  private final UserProfileService userProfileService;

  @PutMapping("/basic")
  @Operation(summary = "Cập nhật thông tin cơ bản của ứng viên")
  public String updateBasic(@CurrentUser Long id, @RequestBody UpdateUserRequest request) {
    userService.updateBasic(id, request);
    return "Profile updated successfully";
  }

  @GetMapping
  @Operation(summary = "Lấy thông tin profile ứng viên hiện tại")
  public ResponseEntity<?> getMyProfile(@CurrentUser Long userId) {
    UserProfile profile = userProfileService.getProfile(userId);
    return ResponseEntity.ok(
        Map.of(
            "id", profile.getId(),
            "headline", profile.getHeadline() != null ? profile.getHeadline() : "",
            "location", profile.getLocation() != null ? profile.getLocation() : "",
            "totalExperienceYears",
                profile.getTotalExperienceYears() != null ? profile.getTotalExperienceYears() : 0,
            "shortBio", profile.getShortBio() != null ? profile.getShortBio() : "",
            "openToWork", Boolean.TRUE.equals(profile.getOpenToWork()),
            "fullName", profile.getFullName() != null ? profile.getFullName() : "",
            "avatarUrl", profile.getAvatarUrl() != null ? profile.getAvatarUrl() : ""));
  }

  @PutMapping("/open-to-work")
  @Operation(summary = "Bật/tắt trạng thái tìm việc (Open to Work)")
  public ResponseEntity<?> toggleOpenToWork(
      @CurrentUser Long userId, @RequestParam("status") boolean status) {
    UserProfile profile = userProfileService.getProfile(userId);
    profile.setOpenToWork(status);
    userProfileService.updateOpenToWork(userId, status);
    return ResponseEntity.ok(
        Map.of("message", status ? "Đã bật tìm việc" : "Đã tắt tìm việc", "openToWork", status));
  }
}

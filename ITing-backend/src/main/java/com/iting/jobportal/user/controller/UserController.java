package com.iting.jobportal.user.controller;

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

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(@CurrentUser String userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }


    @PutMapping("/basic")
    public ResponseEntity<?> updateBasic(@CurrentUser String userId,
                                         @RequestBody UpdateUserRequest req) {
        userService.updateBasic(userId, req);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@CurrentUser String userId,
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

    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar(@CurrentUser String userId) {
        userService.deleteAvatar(userId);
        return ResponseEntity.ok(Map.of("message", "Avatar removed"));
    }

    @PutMapping("/description")
    public ResponseEntity<?> updateDescription(@CurrentUser String userId,
                                               @RequestBody UpdateDescriptionRequest req) {
        userService.updateDescription(userId, req.getDescription());
        return ResponseEntity.ok(Map.of("message", "Description updated"));
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(@CurrentUser String userId,
                                           @RequestBody UpdateAddressRequest req) {
        userService.updateAddress(userId, req.getAddress());
        return ResponseEntity.ok(Map.of("message", "Address updated"));
    }

    @PutMapping("/birth-gender")
    public ResponseEntity<?> updateBirthGender(@CurrentUser String userId,
                                               @RequestBody UpdateBirthGenderRequest req) {
        userService.updateBirthGender(userId, req.getBirthDate(), req.getGender());
        return ResponseEntity.ok(Map.of("message", "Birthdate & gender updated"));
    }
}


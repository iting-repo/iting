package com.iting.jobportal.user.controller;

import com.iting.jobportal.user.dto.*;
import com.iting.jobportal.user.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(@CurrentUser Long userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }


    @PutMapping("/basic")
    public ResponseEntity<?> updateBasic(@CurrentUser Long userId,
                                         @RequestBody UpdateUserRequest req) {
        userService.updateBasic(userId, req);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@CurrentUser Long userId,
                                          @RequestBody UpdateAvatarRequest req) {
        userService.updateAvatar(userId, req.getAvatarUrl());
        return ResponseEntity.ok(Map.of("message", "Avatar updated"));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar(@CurrentUser Long userId) {
        userService.deleteAvatar(userId);
        return ResponseEntity.ok(Map.of("message", "Avatar removed"));
    }

    @PutMapping("/description")
    public ResponseEntity<?> updateDescription(@CurrentUser Long userId,
                                               @RequestBody UpdateDescriptionRequest req) {
        userService.updateDescription(userId, req.getDescription());
        return ResponseEntity.ok(Map.of("message", "Description updated"));
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(@CurrentUser Long userId,
                                           @RequestBody UpdateAddressRequest req) {
        userService.updateAddress(userId, req.getAddress());
        return ResponseEntity.ok(Map.of("message", "Address updated"));
    }

    @PutMapping("/birth-gender")
    public ResponseEntity<?> updateBirthGender(@CurrentUser Long userId,
                                               @RequestBody UpdateBirthGenderRequest req) {
        userService.updateBirthGender(userId, req.getBirthDate(), req.getGender());
        return ResponseEntity.ok(Map.of("message", "Birthdate & gender updated"));
    }
}

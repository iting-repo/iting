package com.iting.jobportal.user.controller;

import com.iting.jobportal.user.dto.UpdateUserRequest;
import com.iting.jobportal.user.dto.UpdateAvatarRequest;
import com.iting.jobportal.user.dto.UpdateDescriptionRequest;
import com.iting.jobportal.user.dto.UpdateAddressRequest;
import com.iting.jobportal.user.dto.UpdateBirthGenderRequest;
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

    private Long getUserId() {
        return 5L; // TODO: replace bằng JWT userId
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(userService.getProfile(getUserId()));
    }

    @PutMapping("/basic")
    public ResponseEntity<?> updateBasic(@RequestBody UpdateUserRequest req) {
        userService.updateBasic(getUserId(), req);
        return ResponseEntity.ok(Map.of("message", "Updated"));
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody UpdateAvatarRequest req) {
        userService.updateAvatar(getUserId(), req.getAvatarUrl());
        return ResponseEntity.ok(Map.of("message", "Avatar updated"));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar() {
        userService.deleteAvatar(getUserId());
        return ResponseEntity.ok(Map.of("message", "Avatar removed"));
    }

    @PutMapping("/description")
    public ResponseEntity<?> updateDescription(@RequestBody UpdateDescriptionRequest req) {
        userService.updateDescription(getUserId(), req.getDescription());
        return ResponseEntity.ok(Map.of("message", "Description updated"));
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(@RequestBody UpdateAddressRequest req) {
        userService.updateAddress(getUserId(), req.getAddress());
        return ResponseEntity.ok(Map.of("message", "Address updated"));
    }

    @PutMapping("/birth-gender")
    public ResponseEntity<?> updateBirthGender(@RequestBody UpdateBirthGenderRequest req) {
        userService.updateBirthGender(getUserId(), req.getBirthDate(), req.getGender());
        return ResponseEntity.ok(Map.of("message", "Birthdate & gender updated"));
    }
}

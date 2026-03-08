package com.iting.jobportal.user.controller;

import com.iting.jobportal.user.dto.UpdateUserRequest;
import com.iting.jobportal.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
public class UserBasicController {

    private final UserService userService;

    @PutMapping("/basic")
    @Operation(summary = "Cập nhật thông tin cơ bản của ứng viên")
    public String updateBasic(
            @CurrentUser Long id, // Đổi từ String userId sang Long id
            @RequestBody UpdateUserRequest request) {

        userService.updateBasic(id, request); // Gọi Service với kiểu Long
        return "Profile updated successfully";
    }
}
package com.iting.jobportal.user.controller;

import com.iting.jobportal.user.dto.UpdateUserRequest;
import com.iting.jobportal.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
public class UserBasiController {

    private final UserService userService;

    @PutMapping("/basic")
    public String updateBasic(
            @com.iting.jobportal.user.controller.CurrentUser Long userId,
            @RequestBody UpdateUserRequest request) {

        userService.updateBasic(userId, request);
        return "Profile updated successfully";
    }



}

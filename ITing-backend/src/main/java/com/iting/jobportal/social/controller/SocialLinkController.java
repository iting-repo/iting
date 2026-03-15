package com.iting.jobportal.social.controller;

import com.iting.jobportal.user.controller.CurrentUser;
import com.iting.jobportal.userprofile.dto.request.SocialLinksBulkRequest;
import com.iting.jobportal.userprofile.dto.response.SocialLinkResponse;
import com.iting.jobportal.userprofile.service.SocialLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/social-links")
@RequiredArgsConstructor
public class SocialLinkController {

    private final SocialLinkService socialLinkService;

    @GetMapping
    public ResponseEntity<SocialLinkResponse> getSocialLinks(@CurrentUser Long userId) {
        return ResponseEntity.ok(socialLinkService.getSocialLinks(String.valueOf(userId)));
    }

    @PutMapping
    public ResponseEntity<?> saveSocialLinks(@CurrentUser Long userId, @RequestBody SocialLinksBulkRequest req) {
        socialLinkService.saveSocialLinks(String.valueOf(userId), req);
        return ResponseEntity.ok(Map.of("message", "Social links updated successfully"));
    }
}

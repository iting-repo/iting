package com.iting.jobportal.userprofile.controller;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.userprofile.service.ProfileCompletenessService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/me/profile")
@RequiredArgsConstructor
public class ProfileCompletenessController {

  private final ProfileCompletenessService completenessService;
  private final JwtTokenUtil jwtTokenUtil;

  /** Returns: { score, maxScore, percentage, level, completedItems[], missingItems[] }. */
  @GetMapping("/completeness")
  public ResponseEntity<Map<String, Object>> getCompleteness(HttpServletRequest request) {
    Long userId = jwtTokenUtil.getUserIdFromHeader(request);
    if (userId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
    }
    return ResponseEntity.ok(completenessService.compute(userId));
  }
}

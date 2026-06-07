package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/config")
@RequiredArgsConstructor
@Tag(name = "System Configuration", description = "Admin APIs for managing system-wide settings")
public class AdminConfigController {

  private final AdminConfigService adminConfigService;
  private final JwtTokenUtil jwtTokenUtil;

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Get system configuration")
  public ResponseEntity<SystemConfig> getConfig() {
    return ResponseEntity.ok(adminConfigService.getConfig());
  }

  @PutMapping
  @PreAuthorize("@perm.has('platform.system.config')")
  @Operation(summary = "Update system configuration")
  public ResponseEntity<SystemConfig> updateConfig(
      @RequestBody SystemConfig config, HttpServletRequest request) {
    Long adminId = jwtTokenUtil.getUserIdFromHeader(request);
    return ResponseEntity.ok(adminConfigService.updateConfig(config, adminId));
  }

  @PostMapping("/reset")
  @PreAuthorize("@perm.has('platform.system.config')")
  @Operation(summary = "Reset configuration to default")
  public ResponseEntity<Void> resetToDefault() {
    adminConfigService.resetToDefault();
    return ResponseEntity.ok().build();
  }

  @PostMapping("/test-email")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Test SMTP connection")
  public ResponseEntity<?> testEmailConnection(@RequestBody SystemConfig config) {
    boolean success = adminConfigService.testSmtpConnection(config);
    if (success) {
      return ResponseEntity.ok().build();
    } else {
      return ResponseEntity.badRequest()
          .body("Kết nối SMTP thất bại. Vui lòng kiểm tra lại cấu hình.");
    }
  }
}

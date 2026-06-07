package com.iting.jobportal.common.controller;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint công khai báo trạng thái bảo trì cho frontend. Nằm dưới {@code /api/public/**} nên KHÔNG
 * bị MaintenanceModeInterceptor chặn (frontend luôn đọc được kể cả khi đang bảo trì).
 */
@Tag(name = "Public - Maintenance", description = "Trạng thái bảo trì hệ thống")
@RestController
@RequestMapping("/api/public/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

  private final AdminConfigService adminConfigService;

  @GetMapping
  @Operation(summary = "Trạng thái bảo trì + thông báo (public)")
  public Map<String, Object> getMaintenanceStatus() {
    boolean on = false;
    String message = "Hệ thống đang bảo trì. Vui lòng quay lại sau.";
    try {
      SystemConfig cfg = adminConfigService.getConfig();
      if (cfg != null) {
        on = Boolean.TRUE.equals(cfg.getMaintenanceMode());
        if (cfg.getMaintenanceMessage() != null && !cfg.getMaintenanceMessage().isBlank()) {
          message = cfg.getMaintenanceMessage();
        }
      }
    } catch (RuntimeException ignored) {
      // lỗi đọc config → coi như không bảo trì
    }
    return Map.of("maintenanceMode", on, "message", message);
  }
}

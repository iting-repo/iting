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
 * Cờ tính năng công khai cho frontend (bật/tắt UI tương ứng). Nằm dưới {@code /api/public/**} nên
 * không bị {@code MaintenanceModeInterceptor} chặn và không yêu cầu đăng nhập.
 */
@Tag(name = "Public - Settings", description = "Cờ tính năng công khai")
@RestController
@RequestMapping("/api/public/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

  private final AdminConfigService adminConfigService;

  @GetMapping
  @Operation(summary = "Cờ tính năng công khai (public)")
  public Map<String, Object> getPublicSettings() {
    boolean allowCompanyReviews = true;
    try {
      SystemConfig cfg = adminConfigService.getConfig();
      if (cfg != null) {
        allowCompanyReviews = !Boolean.FALSE.equals(cfg.getAllowCompanyReviews());
      }
    } catch (RuntimeException ignored) {
      // lỗi đọc config → mặc định bật
    }
    return Map.of("allowCompanyReviews", allowCompanyReviews);
  }
}

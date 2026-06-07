package com.iting.jobportal.common.validation;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

  private static final int DEFAULT_MIN_LEN = 8;
  private static final int MAX_LEN = 100;

  // Optional: chạy trong Spring sẽ được inject; test khởi tạo bằng new → null → dùng default.
  @Autowired(required = false)
  private AdminConfigService adminConfigService;

  private int minLen() {
    if (adminConfigService != null) {
      try {
        SystemConfig cfg = adminConfigService.getConfig();
        if (cfg != null && cfg.getMinPasswordLength() != null && cfg.getMinPasswordLength() > 0) {
          return cfg.getMinPasswordLength();
        }
      } catch (RuntimeException ignored) {
        // Lỗi đọc config → fallback an toàn về mặc định
      }
    }
    return DEFAULT_MIN_LEN;
  }

  @Override
  public boolean isValid(String value, ConstraintValidatorContext ctx) {
    if (value == null || value.isBlank()) return true; // @NotBlank handle riêng

    if (value.length() < minLen() || value.length() > MAX_LEN) return false;

    boolean hasUpper = false;
    boolean hasLower = false;
    boolean hasDigit = false;
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      if (Character.isUpperCase(c)) hasUpper = true;
      else if (Character.isLowerCase(c)) hasLower = true;
      else if (Character.isDigit(c)) hasDigit = true;
      if (hasUpper && hasLower && hasDigit) return true;
    }
    return hasUpper && hasLower && hasDigit;
  }
}

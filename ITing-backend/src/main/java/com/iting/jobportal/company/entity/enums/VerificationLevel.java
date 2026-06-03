package com.iting.jobportal.company.entity.enums;

import lombok.Getter;

@Getter
public enum VerificationLevel {
  UNVERIFIED(0, "Chưa xác thực"),
  BASIC(1, "Xác thực cơ bản (Email)"),
  ADVANCED(2, "Xác thực nâng cao (Giấy phép kinh doanh)"),
  PREMIUM(3, "Đối tác chiến lược");

  private final int value;
  private final String description;

  VerificationLevel(int value, String description) {
    this.value = value;
    this.description = description;
  }
}

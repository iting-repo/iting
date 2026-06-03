package com.iting.jobportal.company.entity.enums;

import lombok.Getter;

@Getter
public enum Industry {
  SOFTWARE_DEVELOPMENT("Phát triển phần mềm", "Software Development"),
  WEB_DEVELOPMENT("Phát triển Web", "Web Development"),
  MOBILE_DEVELOPMENT("Phát triển Mobile", "Mobile Development"),
  CLOUD_COMPUTING("Điện toán đám mây", "Cloud Computing"),
  DEVOPS("DevOps", "DevOps"),
  DATA_SCIENCE("Khoa học dữ liệu", "Data Science"),
  AI("Trí tuệ nhân tạo", "Artificial Intelligence"),
  CYBERSECURITY("An ninh mạng", "Cybersecurity"),
  BLOCKCHAIN("Blockchain", "Blockchain"),
  GAME_DEVELOPMENT("Phát triển Game", "Game Development"),
  QA_TESTING("Kiểm thử (QA)", "QA Testing"),
  IT_SOFTWARE("Phần mềm & CNTT", "IT Software");

  private final String displayName;
  private final String displayNameEn;

  Industry(String displayName, String displayNameEn) {
    this.displayName = displayName;
    this.displayNameEn = displayNameEn;
  }
}

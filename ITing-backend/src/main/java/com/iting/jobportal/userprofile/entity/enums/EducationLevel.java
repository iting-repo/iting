package com.iting.jobportal.userprofile.entity.enums;

public enum EducationLevel {
  HIGH_SCHOOL("Trung học phổ thông"),
  ASSOCIATE("Cao đẳng"),
  BACHELOR("Đại học"),
  MASTER("Thạc sĩ"),
  DOCTORATE("Tiến sĩ"),
  OTHER("Khác");

  private final String description;

  EducationLevel(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }
}

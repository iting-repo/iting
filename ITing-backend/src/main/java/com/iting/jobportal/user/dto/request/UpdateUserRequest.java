package com.iting.jobportal.user.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequest {
  private String fullName;
  private String avatarUrl;
  private String email;
  private String phoneNum;
}

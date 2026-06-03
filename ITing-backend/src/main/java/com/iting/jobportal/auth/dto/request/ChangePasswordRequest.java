package com.iting.jobportal.auth.dto.request;

import com.iting.jobportal.common.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;

public class ChangePasswordRequest {

  @NotBlank(message = "Old password is required")
  private String oldPassword;

  @NotBlank(message = "New password is required")
  @StrongPassword
  private String newPassword;

  public String getOldPassword() {
    return oldPassword;
  }

  public void setOldPassword(String oldPassword) {
    this.oldPassword = oldPassword;
  }

  public String getNewPassword() {
    return newPassword;
  }

  public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
  }
}

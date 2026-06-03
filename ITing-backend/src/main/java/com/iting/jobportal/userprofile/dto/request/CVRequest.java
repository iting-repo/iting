package com.iting.jobportal.userprofile.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CVRequest {
  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "File URL is required")
  private String fileUrl;

  private Boolean isDefault = false;
}

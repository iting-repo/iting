package com.iting.jobportal.userprofile.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioRequest {
  @NotBlank(message = "Title is required")
  private String title;

  @NotBlank(message = "URL is required")
  private String url;

  private String description;
}

package com.iting.jobportal.userprofile.dto.request;

import com.iting.jobportal.userprofile.entity.enums.SocialPlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SocialLinkRequest {
  @NotNull(message = "Platform is required")
  private SocialPlatform platform;

  @NotBlank(message = "URL is required")
  private String url;
}

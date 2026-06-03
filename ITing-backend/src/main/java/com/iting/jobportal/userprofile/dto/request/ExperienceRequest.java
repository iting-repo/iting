package com.iting.jobportal.userprofile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class ExperienceRequest {
  @NotBlank(message = "Company name is required")
  private String companyName;

  @NotBlank(message = "Position is required")
  private String position;

  @NotNull(message = "Start date is required")
  private LocalDate startDate;

  private LocalDate endDate;

  private Boolean isCurrent = false;

  private String description;
}

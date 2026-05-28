package com.iting.jobportal.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplyJobRequest {

  @NotNull(message = "Job ID không được để trống")
  private Long jobId;

  private Long cvId;

  private String coverLetter;
}

package com.iting.jobportal.application.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DeclineOfferRequest {
  @Size(max = 2000)
  private String reason;
}

package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobApprovalRequest {
  @NotNull private Boolean approved;

  private String rejectReason; // Nếu từ chối
}

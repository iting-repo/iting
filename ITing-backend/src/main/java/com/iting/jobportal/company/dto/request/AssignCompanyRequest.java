package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Admin gán affiliation (HR) vào một công ty cụ thể từ dropdown. */
@Data
public class AssignCompanyRequest {

  @NotNull(message = "companyId không được để trống")
  private Long companyId;
}

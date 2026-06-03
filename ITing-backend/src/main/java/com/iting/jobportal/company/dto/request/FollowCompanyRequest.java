package com.iting.jobportal.company.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FollowCompanyRequest {

  @NotNull(message = "Company ID is required")
  private Long companyId;
}

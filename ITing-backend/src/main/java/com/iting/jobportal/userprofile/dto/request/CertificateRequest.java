package com.iting.jobportal.userprofile.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CertificateRequest {
  @NotBlank(message = "Title is required")
  private String title;

  // Optional: AI auto-fill có thể không trích được. DB cho phép null.
  private String issuingOrganization;

  // Optional: same lý do — frontend form đã có required check riêng nếu cần.
  private LocalDate issueDate;

  private LocalDate expirationDate;

  private String credentialId;

  private String credentialUrl;

  private Boolean doesNotExpire = false;
}

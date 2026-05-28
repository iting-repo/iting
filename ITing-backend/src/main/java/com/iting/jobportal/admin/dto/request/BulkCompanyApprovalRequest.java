package com.iting.jobportal.admin.dto.request;

import com.iting.jobportal.company.entity.enums.VerificationLevel;
import java.util.List;
import lombok.Data;

@Data
public class BulkCompanyApprovalRequest {
  private List<Long> ids;
  private VerificationLevel verificationLevel;
  private String note;
}

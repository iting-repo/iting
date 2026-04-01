package com.iting.jobportal.admin.dto;

import com.iting.jobportal.company.entity.enums.VerificationLevel;
import lombok.Data;
import java.util.List;

@Data
public class BulkCompanyApprovalRequest {
    private List<Long> ids;
    private VerificationLevel verificationLevel;
    private String note;
}

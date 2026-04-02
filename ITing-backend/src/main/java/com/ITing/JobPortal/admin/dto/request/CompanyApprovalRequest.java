package com.iting.jobportal.admin.dto.request;

import com.iting.jobportal.company.entity.enums.VerificationLevel;
import lombok.Data;

@Data
public class CompanyApprovalRequest {
    private VerificationLevel verificationLevel;
    private String note;
}

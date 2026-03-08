package com.iting.jobportal.admin.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class JobApprovalRequest {
    @NotNull
    private Boolean approved;
    
    private String rejectReason;  // Nếu từ chối
}


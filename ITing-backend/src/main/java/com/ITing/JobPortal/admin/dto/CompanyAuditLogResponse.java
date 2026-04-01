package com.iting.jobportal.admin.dto;

import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAuditLogResponse {

    private LocalDateTime time;
    private String companyName;
    private CompanyAuditAction action;
    private String fromStatus;
    private String toStatus;
    private String reason;
    private String note;
    private String actor;
    private Long actorId;

    public String getStatusChange() {
        String from = fromStatus != null ? fromStatus : "";
        String to = toStatus != null ? toStatus : "";
        return from + "→" + to;
    }
}
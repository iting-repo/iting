package com.iting.jobportal.admin.dto.response;

import com.iting.jobportal.company.entity.enums.CompanyAuditAction;

import java.time.LocalDateTime;

public interface CompanyAuditLogView {
    LocalDateTime getCreatedAt();

    String getCompanyName();

    CompanyAuditAction getAction();

    String getFromStatus();

    String getToStatus();

    String getReason();

    String getNote();

    String getActor();

    Long getActorId();
}
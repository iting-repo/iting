package com.iting.jobportal.company.service;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyAuditLog;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import com.iting.jobportal.company.repository.CompanyAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CompanyAuditService {

    private final CompanyAuditLogRepository auditLogRepository;

    public void log(
            Company company,
            CompanyAuditAction action,
            String fromStatus,
            String toStatus,
            String reason,
            String note,
            String actor,
            Long actorId
    ) {
        CompanyAuditLog log = CompanyAuditLog.builder()
                .company(company)
                .action(action)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .reason(reason)
                .note(note)
                .actor(actor)
                .actorId(actorId)
                .createdAt(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }
}
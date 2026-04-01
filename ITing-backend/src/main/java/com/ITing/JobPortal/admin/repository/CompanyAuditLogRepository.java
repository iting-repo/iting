package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.CompanyAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyAuditLogRepository extends JpaRepository<CompanyAuditLog, Long> {

    List<CompanyAuditLog> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}
package com.iting.jobportal.company.repository;

import com.iting.jobportal.admin.dto.CompanyAuditLogResponse;
import com.iting.jobportal.company.entity.CompanyAuditLog;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CompanyAuditLogRepository extends JpaRepository<CompanyAuditLog, Long> {

    List<CompanyAuditLog> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<CompanyAuditLog> findAllByOrderByCreatedAtDesc();
    @Query("""
        SELECT new com.iting.jobportal.admin.dto.CompanyAuditLogResponse(
            l.createdAt,
            c.name,
            l.action,
            l.fromStatus,
            l.toStatus,
            l.reason,
            l.note,
            l.actor,
            l.actorId
        )
        FROM CompanyAuditLog l
        LEFT JOIN Company c ON c.id = l.companyId
        ORDER BY l.createdAt DESC
    """)
    List<CompanyAuditLogResponse> findAllWithCompany();

    @Query("""
    SELECT new com.iting.jobportal.admin.dto.CompanyAuditLogResponse(
        l.createdAt,
        c.name,
        l.action,
        l.fromStatus,
        l.toStatus,
        l.reason,
        l.note,
        l.actor,
        l.actorId
    )
    FROM CompanyAuditLog l
    LEFT JOIN Company c ON c.id = l.companyId
    WHERE (:action IS NULL OR l.action = :action)
      AND (:companyId IS NULL OR l.companyId = :companyId)
      AND l.createdAt >= :fromDate
      AND l.createdAt <= :toDate
    ORDER BY l.createdAt DESC
""")
    List<CompanyAuditLogResponse> findAllWithCompanyFiltered(
            @Param("action") CompanyAuditAction action,
            @Param("companyId") Long companyId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
package com.iting.jobportal.company.repository;

import com.iting.jobportal.admin.dto.response.CompanyAuditLogView;
import com.iting.jobportal.company.entity.CompanyAuditLog;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CompanyAuditLogRepository extends JpaRepository<CompanyAuditLog, Long> {

    List<CompanyAuditLog> findByCompany_IdOrderByCreatedAtDesc(Long companyId);

    List<CompanyAuditLog> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT
            l.createdAt as createdAt,
            c.name as companyName,
            l.action as action,
            l.fromStatus as fromStatus,
            l.toStatus as toStatus,
            l.reason as reason,
            l.note as note,
            l.actor as actor,
            l.actorId as actorId
        FROM CompanyAuditLog l
        LEFT JOIN l.company c
        ORDER BY l.createdAt DESC
    """)
    List<CompanyAuditLogView> findAllWithCompany();

    @Query("""
        SELECT
            l.createdAt as createdAt,
            c.name as companyName,
            l.action as action,
            l.fromStatus as fromStatus,
            l.toStatus as toStatus,
            l.reason as reason,
            l.note as note,
            l.actor as actor,
            l.actorId as actorId
        FROM CompanyAuditLog l
        LEFT JOIN l.company c
        WHERE (:action IS NULL OR l.action = :action)
          AND (:companyId IS NULL OR c.id = :companyId)
          AND l.createdAt >= :fromDate
          AND l.createdAt <= :toDate
        ORDER BY l.createdAt DESC
    """)
    List<CompanyAuditLogView> findAllWithCompanyFiltered(
            @Param("action") CompanyAuditAction action,
            @Param("companyId") Long companyId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
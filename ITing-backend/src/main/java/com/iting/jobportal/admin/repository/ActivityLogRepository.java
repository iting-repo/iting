package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.ActivityLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivityLogRepository
    extends JpaRepository<ActivityLog, Long>, JpaSpecificationExecutor<ActivityLog> {

  Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  Page<ActivityLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

  @Query("SELECT a FROM ActivityLog a WHERE a.createdAt >= :since ORDER BY a.createdAt DESC")
  List<ActivityLog> findRecentActivities(@Param("since") LocalDateTime since, Pageable pageable);

  long countByActionAndCreatedAtAfter(String action, LocalDateTime since);

  @Query(
      "SELECT DISTINCT a.entityType FROM ActivityLog a "
          + "WHERE a.entityType IS NOT NULL AND a.entityType <> '' ORDER BY a.entityType")
  List<String> findDistinctEntityTypes();
}

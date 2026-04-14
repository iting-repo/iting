package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.UserReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserReportRepository extends JpaRepository<UserReport, Long> {
    
    Page<UserReport> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    
    List<UserReport> findByTargetTypeAndTargetId(String targetType, Long targetId);
    
    long countByStatus(String status);
    
    long countByPriority(String priority);
    
    long countByTargetType(String targetType);
}


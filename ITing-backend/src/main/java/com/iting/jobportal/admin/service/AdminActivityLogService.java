package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.entity.ActivityLog;
import org.springframework.data.domain.Page;

public interface AdminActivityLogService {

  void logActivity(
      Long userId, String action, String entityType, Long entityId, String description);

  Page<ActivityLog> getActivityLogs(Long userId, String action, int page, int size);

  Page<AuditLogResponse> getAuditLogs(
      String category, Long performerId, String action, String search, int page, int size);
}

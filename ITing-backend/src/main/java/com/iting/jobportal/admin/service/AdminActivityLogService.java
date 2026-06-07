package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.entity.ActivityLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;

public interface AdminActivityLogService {

  /** Danh sách entityType (danh mục) thực tế đang có trong audit log — cho dropdown lọc. */
  List<String> getDistinctCategories();

  void logActivity(
      Long userId, String action, String entityType, Long entityId, String description);

  Page<ActivityLog> getActivityLogs(Long userId, String action, int page, int size);

  Page<AuditLogResponse> getAuditLogs(
      String category,
      Long performerId,
      String action,
      String risk,
      String search,
      LocalDateTime dateFrom,
      LocalDateTime dateTo,
      int page,
      int size);
}

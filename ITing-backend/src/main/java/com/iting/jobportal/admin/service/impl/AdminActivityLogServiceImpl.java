package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.entity.ActivityLog;
import com.iting.jobportal.admin.repository.ActivityLogRepository;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminActivityLogServiceImpl implements AdminActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void logActivity(Long userId, String action, String entityType, Long entityId, String description) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .build();

        activityLogRepository.save(log);
    }

    @Override
    public Page<ActivityLog> getActivityLogs(Long userId, String action, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogRepository.findAll(pageable);
    }
}
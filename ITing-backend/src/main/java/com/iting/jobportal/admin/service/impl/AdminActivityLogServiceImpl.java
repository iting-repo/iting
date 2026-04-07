package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.entity.ActivityLog;
import com.iting.jobportal.admin.entity.Admin;
import com.iting.jobportal.admin.repository.ActivityLogRepository;
import com.iting.jobportal.admin.repository.AdminRepository;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminActivityLogServiceImpl implements AdminActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final AccountRepository accountRepository;
    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

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
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (userId != null) {
            return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        return activityLogRepository.findAll(pageable);
    }

    @Override
    public Page<AuditLogResponse> getAuditLogs(String category, Long performerId, String action, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // This is a simplified filtering. In production, use Specification or QueryDSL for multiple filters.
        Page<ActivityLog> logs = activityLogRepository.findAll(pageable);
        
        return logs.map(this::mapToAuditResponse);
    }

    private AuditLogResponse mapToAuditResponse(ActivityLog log) {
        AuditLogResponse response = AuditLogResponse.builder()
                .id(log.getId())
                .timestamp(log.getCreatedAt())
                .category(log.getEntityType())
                .action(log.getAction())
                .target(log.getTargetName() != null ? log.getTargetName() : (log.getEntityType() + " #" + log.getEntityId()))
                .detail(log.getDescription())
                .fromStatus(log.getFromStatus())
                .toStatus(log.getToStatus())
                .ip(log.getIpAddress())
                .build();

        // Resolve Performer Info
        Optional<Account> accountOpt = accountRepository.findById(log.getUserId());
        if (accountOpt.isPresent()) {
            Account account = accountOpt.get();
            response.setPerformerRole(account.getRole().toString());
            
            // Try to get Admin name
            Optional<Admin> adminOpt = adminRepository.findById(account.getId());
            if (adminOpt.isPresent()) {
                response.setPerformer(adminOpt.get().getFullName());
            } else {
                // Try to get User name
                Optional<User> userOpt = userRepository.findById(account.getId());
                response.setPerformer(userOpt.map(User::getFullName).orElse(account.getEmail()));
            }
        } else {
            response.setPerformer("Hệ thống");
            response.setPerformerRole("SYSTEM");
        }

        return response;
    }
}
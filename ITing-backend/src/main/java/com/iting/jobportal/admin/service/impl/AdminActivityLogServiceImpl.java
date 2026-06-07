package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.response.AuditLogResponse;
import com.iting.jobportal.admin.entity.ActivityLog;
import com.iting.jobportal.admin.repository.ActivityLogRepository;
import com.iting.jobportal.admin.service.AdminActivityLogService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.audit.AuditRisk;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminActivityLogServiceImpl implements AdminActivityLogService {

  private final ActivityLogRepository activityLogRepository;
  private final AccountRepository accountRepository;

  @Override
  public void logActivity(
      Long userId, String action, String entityType, Long entityId, String description) {
    ActivityLog log =
        ActivityLog.builder()
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
  public List<String> getDistinctCategories() {
    return activityLogRepository.findDistinctEntityTypes();
  }

  @Override
  public Page<AuditLogResponse> getAuditLogs(
      String category,
      Long performerId,
      String action,
      String risk,
      String search,
      LocalDateTime dateFrom,
      LocalDateTime dateTo,
      int page,
      int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

    Specification<ActivityLog> spec =
        (root, query, cb) -> {
          List<Predicate> ps = new ArrayList<>();
          if (category != null && !category.isBlank()) {
            // Danh mục giờ là entityType thực tế (dropdown động) → so khớp chính xác.
            ps.add(cb.equal(cb.lower(root.get("entityType")), category.toLowerCase()));
          }
          if (performerId != null) {
            ps.add(cb.equal(root.get("userId"), performerId));
          }
          if (action != null && !action.isBlank()) {
            ps.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
          }
          if (risk != null && !risk.isBlank()) {
            ps.add(cb.equal(cb.upper(root.get("riskLevel")), risk.toUpperCase()));
          }
          if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            ps.add(
                cb.or(
                    cb.like(cb.lower(root.get("action")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(root.get("targetName")), like)));
          }
          if (dateFrom != null) {
            ps.add(cb.greaterThanOrEqualTo(root.get("createdAt"), dateFrom));
          }
          if (dateTo != null) {
            ps.add(cb.lessThanOrEqualTo(root.get("createdAt"), dateTo));
          }
          return cb.and(ps.toArray(new Predicate[0]));
        };

    return activityLogRepository.findAll(spec, pageable).map(this::mapToAuditResponse);
  }

  private AuditLogResponse mapToAuditResponse(ActivityLog log) {
    AuditLogResponse response =
        AuditLogResponse.builder()
            .id(log.getId())
            .timestamp(log.getCreatedAt())
            .category(log.getEntityType())
            .action(log.getAction())
            .target(
                log.getTargetName() != null
                    ? log.getTargetName()
                    : (log.getEntityId() != null
                        // Có ID → "EntityType #id"; không có ID → chỉ tên loại, KHÔNG kèm "#null".
                        ? log.getEntityType() + " #" + log.getEntityId()
                        : log.getEntityType()))
            .detail(log.getDescription())
            .fromStatus(log.getFromStatus())
            .toStatus(log.getToStatus())
            .ip(log.getIpAddress())
            .userAgent(log.getUserAgent())
            // Bản ghi cũ chưa có risk_level → suy ra để hiển thị/lọc nhất quán.
            .riskLevel(
                log.getRiskLevel() != null
                    ? log.getRiskLevel()
                    : AuditRisk.level(log.getAction(), log.getEntityType(), log.getDescription()))
            .changes(log.getChanges())
            .build();

    // Resolve Performer Info — fullName giờ ở Account (sau V83), không còn ở User/Admin.
    Optional<Account> accountOpt = accountRepository.findById(log.getUserId());
    if (accountOpt.isPresent()) {
      Account account = accountOpt.get();
      response.setPerformerRole(account.getRole().toString());
      response.setPerformer(
          account.getFullName() != null ? account.getFullName() : account.getEmail());
    } else {
      response.setPerformer("Hệ thống");
      response.setPerformerRole("SYSTEM");
    }

    return response;
  }
}

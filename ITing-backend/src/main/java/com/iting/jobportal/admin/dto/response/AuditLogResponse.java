package com.iting.jobportal.admin.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
  private Long id;
  private LocalDateTime timestamp;
  private String performer; // Full name or Email
  private String performerRole;
  private String category; // EntityType
  private String action;
  private String target; // TargetName or EntityId
  private String detail; // Description
  private String fromStatus;
  private String toStatus;
  private String ip;
  private String userAgent;
  private String riskLevel; // LOW | MEDIUM | HIGH | CRITICAL
  private String changes; // JSON: [{"field","from","to"}, ...]
}

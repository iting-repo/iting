package com.iting.jobportal.common.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.admin.entity.ActivityLog;
import com.iting.jobportal.admin.repository.ActivityLogRepository;
import com.iting.jobportal.auth.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Tự động ghi log mỗi hành động ADMIN có side-effect (POST/PUT/DELETE/PATCH trên bất kỳ controller
 * nào trong gói admin.controller). Trang /admin/audit từng rỗng vì service.logActivity() chưa được
 * gọi từ đâu cả; aspect này giải quyết bằng cách "logging-as-a-cross-cutting-concern" thay vì rải
 * save() khắp từng endpoint.
 *
 * <p>Chiến lược: • Chỉ log SAU KHI handler trả về thành công (@AfterReturning) — request fail
 * (4xx/5xx) không tạo nhiễu trong audit. • Bỏ GET — chỉ những thao tác thay đổi state mới quan
 * trọng để audit. • Lỗi khi ghi log KHÔNG được throw — nuốt với log.warn để không vỡ business flow
 * vì hệ thống audit "best-effort".
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuditAspect {

  private final ActivityLogRepository activityLogRepository;
  private final ObjectMapper objectMapper;

  @Pointcut("within(com.iting.jobportal.admin.controller..*)")
  public void inAdminController() {}

  @Pointcut(
      "@annotation(org.springframework.web.bind.annotation.PostMapping) "
          + "|| @annotation(org.springframework.web.bind.annotation.PutMapping) "
          + "|| @annotation(org.springframework.web.bind.annotation.DeleteMapping) "
          + "|| @annotation(org.springframework.web.bind.annotation.PatchMapping)")
  public void writeMethod() {}

  @AfterReturning(pointcut = "inAdminController() && writeMethod()")
  public void logAdminWrite(JoinPoint jp) {
    try {
      HttpServletRequest req = currentRequest();
      if (req == null) return;

      Long userId = currentUserId();
      if (userId == null) return; // Không xác thực được → skip, tránh row mồ côi

      String method = req.getMethod();
      String uri = req.getRequestURI();
      String controller = jp.getTarget().getClass().getSimpleName();
      String entityType = controller.replaceFirst("^Admin", "").replaceFirst("Controller$", "");
      if (entityType.isEmpty()) entityType = controller;

      String action = toAction(method);
      String description = method + " " + uri;

      ActivityLog row =
          ActivityLog.builder()
              .userId(userId)
              .action(action)
              .entityType(entityType)
              .description(description)
              .ipAddress(clientIp(req))
              .userAgent(truncate(req.getHeader("User-Agent"), 255))
              .riskLevel(AuditRisk.level(action, entityType, description))
              .changes(serializeChanges())
              .build();

      activityLogRepository.save(row);
    } catch (Exception e) {
      log.warn("Audit log write failed: {}", e.getMessage());
    }
  }

  /** Luôn dọn ThreadLocal sau mỗi request write (kể cả khi handler ném lỗi) → tránh rò rỉ thread. */
  @After("inAdminController() && writeMethod()")
  public void clearAuditContext() {
    AuditContext.clear();
  }

  /** Serialize changeset (nếu service đã đóng góp qua AuditContext) thành JSON. */
  private String serializeChanges() {
    List<Map<String, Object>> changes = AuditContext.getChanges();
    if (changes == null || changes.isEmpty()) return null;
    try {
      return objectMapper.writeValueAsString(changes);
    } catch (Exception e) {
      return null;
    }
  }

  private static String toAction(String method) {
    return switch (method) {
      case "POST" -> "CREATE";
      case "PUT" -> "UPDATE";
      case "PATCH" -> "PATCH";
      case "DELETE" -> "DELETE";
      default -> method;
    };
  }

  private static Long currentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) return null;
    Object principal = auth.getPrincipal();
    if (principal instanceof AuthUser au) return au.getId();
    return null;
  }

  private static HttpServletRequest currentRequest() {
    var attrs = RequestContextHolder.getRequestAttributes();
    return attrs instanceof ServletRequestAttributes sra ? sra.getRequest() : null;
  }

  private static String clientIp(HttpServletRequest req) {
    String fwd = req.getHeader("X-Forwarded-For");
    if (fwd != null && !fwd.isBlank()) return fwd.split(",")[0].trim();
    String real = req.getHeader("X-Real-IP");
    return (real != null && !real.isBlank()) ? real : req.getRemoteAddr();
  }

  private static String truncate(String s, int max) {
    if (s == null) return null;
    return s.length() <= max ? s : s.substring(0, max);
  }
}

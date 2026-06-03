package com.iting.jobportal.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Log warning + thêm response header {@code X-Deprecated-Path: replacement} cho mọi URL legacy đã
 * có alias mới sau Phase 4.
 *
 * <p>Mục đích: monitor xem FE/client nào còn gọi alias cũ để track lúc nào đủ điều kiện remove old
 * controllers.
 *
 * <p>Lifecycle: dual-mount 2 sprint, sau đó remove cả interceptor lẫn old controllers.
 */
@Slf4j
@Component
public class DeprecatedPathInterceptor implements HandlerInterceptor {

  /** Mapping: prefix cũ → prefix mới (URI path, đối chiếu bằng startsWith). */
  private static final Map<String, String> DEPRECATIONS = new LinkedHashMap<>();

  static {
    DEPRECATIONS.put("/api/employer/jobs", "/api/hr/jobs");
    DEPRECATIONS.put("/api/employers/candidates", "/api/hr/candidates");
    // /api/companies/me/* — không alias 1-1 (HR side đã đổi semantics qua affiliation)
    // nhưng vẫn log để biết FE còn dùng.
    DEPRECATIONS.put("/api/companies/me", "/api/hr/affiliations/me  hoặc  /api/hr/companies/{id}");
  }

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    String uri = request.getRequestURI();
    for (Map.Entry<String, String> e : DEPRECATIONS.entrySet()) {
      if (uri.startsWith(e.getKey())) {
        String replacement = e.getValue();
        log.warn(
            "[DEPRECATED] {} {} → please migrate to {} (will be removed in 2 sprints)",
            request.getMethod(),
            uri,
            replacement);
        response.setHeader("X-Deprecated-Path", e.getKey());
        response.setHeader("X-Replacement-Path", replacement);
        response.setHeader("Deprecation", "true");
        break;
      }
    }
    return true;
  }
}

package com.iting.jobportal.common.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.admin.service.AdminConfigService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceModeInterceptor implements HandlerInterceptor {

  private final AdminConfigService adminConfigService;
  private final ObjectMapper objectMapper = new ObjectMapper();

  private static final String HEADER_MAINTAINCE_MODE = "X-Maintenance-Mode";
  private static final String HEADER_CONTENT_TYPE = "Content-Type";

  private static final String CONTENT_TYPE_JSON = "application/json";
  private static final String CONTENT_TYPE_HTML = "text/html;charset=utf-8";

  private final AtomicReference<CachedConfig> configCache = new AtomicReference<>();
  private static final long CACHE_TTL_MS = 5000;

  private record CachedConfig(boolean maintenanceMode, String maintenanceMessage, long fetchTime) {}

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    String path = request.getRequestURI();

    if (isExcludedPath(path)) {
      return true;
    }

    CachedConfig cached = configCache.get();
    long now = System.currentTimeMillis();

    boolean maintenanceMode;
    String maintenanceMessage;

    if (cached != null && (now - cached.fetchTime) < CACHE_TTL_MS) {
      maintenanceMode = cached.maintenanceMode();
      maintenanceMessage = cached.maintenanceMessage();
    } else {
      var config = adminConfigService.getConfig();
      maintenanceMode = Boolean.TRUE.equals(config.getMaintenanceMode());
      maintenanceMessage =
          config.getMaintenanceMessage() != null
              ? config.getMaintenanceMessage()
              : "Hệ thống đang bảo trì. Vui lòng quay lại sau.";
      configCache.set(new CachedConfig(maintenanceMode, maintenanceMessage, now));
    }

    response.setHeader(HEADER_MAINTAINCE_MODE, String.valueOf(maintenanceMode));

    if (!maintenanceMode) {
      return true;
    }

    handleMaintenanceResponse(request, response, maintenanceMessage);
    return false;
  }

  private boolean isExcludedPath(String path) {
    return path.startsWith("/api/admin/")
        || path.startsWith("/api/public/")
        || path.startsWith("/api/auth/")
        || path.contains("/api/admin/config");
  }

  private void handleMaintenanceResponse(
      HttpServletRequest request, HttpServletResponse response, String maintenanceMessage)
      throws Exception {
    String acceptHeader = request.getHeader("Accept");
    boolean isHtmlRequest = acceptHeader != null && acceptHeader.contains("text/html");

    response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    response.setHeader(HEADER_CONTENT_TYPE, isHtmlRequest ? CONTENT_TYPE_HTML : CONTENT_TYPE_JSON);

    if (isHtmlRequest) {
      String html = buildMaintenanceHtml(maintenanceMessage);
      response.getWriter().write(html);
    } else {
      Map<String, Object> errorBody =
          Map.of(
              "error",
              "MAINTENANCE_MODE",
              "message",
              maintenanceMessage,
              "timestamp",
              LocalDateTime.now().toString(),
              "status",
              503);
      response.getWriter().write(objectMapper.writeValueAsString(errorBody));
    }
  }

  private String buildMaintenanceHtml(String message) {
    return """
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ thống đang bảo trì - ITing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 500px;
        }
        .icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            border-radius: 50%%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
        }
        .icon svg {
            width: 40px;
            height: 40px;
            fill: white;
        }
        h1 {
            color: #1a202c;
            font-size: 28px;
            margin-bottom: 16px;
            font-weight: 700;
        }
        p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .footer {
            color: #a0aec0;
            font-size: 14px;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top-color: #667eea;
            border-radius: 50%%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <div class="icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
        </div>
        <h1>Đang bảo trì</h1>
        <p>%s</p>
        <div class="footer">ITing Vietnam</div>
    </div>
</body>
</html>
"""
        .formatted(message);
  }
}

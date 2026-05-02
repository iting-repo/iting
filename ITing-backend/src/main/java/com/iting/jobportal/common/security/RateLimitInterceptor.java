package com.iting.jobportal.common.security;

import com.iting.service.RedisRateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RedisRateLimitingService redisRateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String ip = getRemoteAddr(request);
        String uri = request.getRequestURI();

        String endpoint = null;
        int maxRequests = 0;
        int windowSeconds = 60; // default 1 minute

        if (uri.endsWith("/api/auth/login")) {
            endpoint = "login";
            maxRequests = 20;
        } else if (uri.endsWith("/api/auth/register")) {
            endpoint = "register";
            maxRequests = 10;
        } else if (uri.endsWith("/api/auth/refresh")) {
            endpoint = "refresh";
            maxRequests = 10;
        } else if (uri.contains("/api/jobs/search")) {
            endpoint = "search";
            maxRequests = 30;
        } else if (uri.contains("/api/admin/")) {
            endpoint = "admin";
            maxRequests = 20;
        }

        if (endpoint != null) {
            boolean allowed = redisRateLimitingService.isAllowed(ip, endpoint, maxRequests, windowSeconds);
            if (allowed) {
                long remaining = maxRequests - redisRateLimitingService.getRemainingRequests(ip, endpoint);
                response.addHeader("X-Rate-Limit-Remaining", String.valueOf(Math.max(0, remaining)));
                return true;
            } else {
                long waitForRefill = redisRateLimitingService.getTTL(ip, endpoint);
                response.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
                response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(),
                        "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau " + waitForRefill + " giây.");
                log.warn("Rate limit exceeded for IP: {} on URI: {}", ip, uri);
                return false;
            }
        }

        return true;
    }

    private String getRemoteAddr(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}

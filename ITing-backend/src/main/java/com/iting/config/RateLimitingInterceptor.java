package com.iting.config;

import com.iting.service.RedisRateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final RedisRateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String clientIp = getClientIp(request);
        String endpoint = request.getRequestURI();

        int maxRequests = getMaxRequests(endpoint);
        int windowSeconds = 60;

        boolean allowed = rateLimitingService.isAllowed(clientIp, endpoint, maxRequests, windowSeconds);

        if (!allowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("Retry-After", String.valueOf(
                    rateLimitingService.getTTL(clientIp, endpoint)));
            log.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIp, endpoint);
            return false;
        }

        long remaining = maxRequests - rateLimitingService.getRemainingRequests(clientIp, endpoint);
        response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, remaining)));

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim();
    }

    private int getMaxRequests(String endpoint) {
        if (endpoint.startsWith("/api/auth/login"))
            return 5;
        if (endpoint.startsWith("/api/auth/register"))
            return 3;
        if (endpoint.startsWith("/api/"))
            return 100;
        return 200;
    }
}

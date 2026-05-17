package com.iting.jobportal.common.security;

import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RedisRateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "true")
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RedisRateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String ip = getRemoteAddr(request);
        String uri = request.getRequestURI();

        RateLimitPolicy policy = resolvePolicy(uri);
        if (policy == null) {
            return true; // no rate-limit for this URI
        }

        boolean allowed = rateLimitingService.tryConsume(policy, ip);
        if (!allowed) {
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(),
                    "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
            log.warn("Rate limit exceeded for IP: {} on URI: {} (policy={})", ip, uri, policy);
            return false;
        }
        return true;
    }

    private RateLimitPolicy resolvePolicy(String uri) {
        if (uri.endsWith("/api/auth/login"))       return RateLimitPolicy.LOGIN;
        if (uri.endsWith("/api/auth/register"))     return RateLimitPolicy.REGISTER;
        if (uri.endsWith("/api/auth/refresh"))      return RateLimitPolicy.REFRESH;
        if (uri.contains("/api/jobs/search"))       return RateLimitPolicy.PUBLIC_SEARCH;
        if (uri.contains("/api/admin/"))            return RateLimitPolicy.ADMIN;
        return null;
    }

    private String getRemoteAddr(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

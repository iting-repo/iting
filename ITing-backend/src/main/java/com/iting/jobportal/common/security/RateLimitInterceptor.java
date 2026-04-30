package com.iting.jobportal.common.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
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

    private final RateLimitService rateLimitService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String ip = getRemoteAddr(request);
        String uri = request.getRequestURI();

        Bucket bucket = null;

        if (uri.endsWith("/api/auth/login")) {
            bucket = rateLimitService.resolveLoginBucket(ip);
        } else if (uri.endsWith("/api/auth/register")) {
            bucket = rateLimitService.resolveRegisterBucket(ip);
        } else if (uri.endsWith("/api/auth/refresh")) {
            bucket = rateLimitService.resolveRefreshBucket(ip);
        } else if (uri.contains("/api/jobs/search")) {
            bucket = rateLimitService.resolveSearchBucket(ip);
        } else if (uri.contains("/api/admin/")) {
            bucket = rateLimitService.resolveAdminBucket(ip);
        }

        if (bucket != null) {
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
            if (probe.isConsumed()) {
                response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
                return true;
            } else {
                long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
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

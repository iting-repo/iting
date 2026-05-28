package com.iting.jobportal.common.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import com.iting.jobportal.common.ratelimit.RedisRateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Cover toàn bộ logic của RateLimitInterceptor: - resolvePolicy theo URI suffix/contains -
 * tryConsume allowed → return true (continue chain) - tryConsume denied → 429 + return false (chặn
 * handler) - URI không match policy nào → return true ngay, không gọi rate limiter -
 * X-Forwarded-For: split[0] (nginx proxy chain) - X-Forwarded-For null → fallback
 * request.getRemoteAddr()
 */
@ExtendWith(MockitoExtension.class)
class RateLimitInterceptorTest {

  @Mock private RedisRateLimitingService rateLimitingService;
  @Mock private HttpServletRequest request;
  @Mock private HttpServletResponse response;
  @InjectMocks private RateLimitInterceptor interceptor;

  // ── Policy resolution ────────────────────────────────────────────────

  @Test
  void preHandle_loginUri_usesLoginPolicy() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/auth/login");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("10.0.0.1");
    when(rateLimitingService.tryConsume(RateLimitPolicy.LOGIN, "10.0.0.1")).thenReturn(true);

    assertTrue(interceptor.preHandle(request, response, new Object()));
    verify(rateLimitingService).tryConsume(RateLimitPolicy.LOGIN, "10.0.0.1");
  }

  @Test
  void preHandle_registerUri_usesRegisterPolicy() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/auth/register");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("ip");
    when(rateLimitingService.tryConsume(eq(RateLimitPolicy.REGISTER), eq("ip"))).thenReturn(true);

    interceptor.preHandle(request, response, new Object());
    verify(rateLimitingService).tryConsume(RateLimitPolicy.REGISTER, "ip");
  }

  @Test
  void preHandle_refreshUri_usesRefreshPolicy() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/auth/refresh");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("ip");
    when(rateLimitingService.tryConsume(eq(RateLimitPolicy.REFRESH), eq("ip"))).thenReturn(true);

    interceptor.preHandle(request, response, new Object());
    verify(rateLimitingService).tryConsume(RateLimitPolicy.REFRESH, "ip");
  }

  @Test
  void preHandle_publicSearchUri_usesPublicSearchPolicy() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/jobs/search?keyword=java");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("ip");
    when(rateLimitingService.tryConsume(eq(RateLimitPolicy.PUBLIC_SEARCH), eq("ip")))
        .thenReturn(true);

    interceptor.preHandle(request, response, new Object());
    verify(rateLimitingService).tryConsume(RateLimitPolicy.PUBLIC_SEARCH, "ip");
  }

  @Test
  void preHandle_adminUri_usesAdminPolicy() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/admin/companies");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("ip");
    when(rateLimitingService.tryConsume(eq(RateLimitPolicy.ADMIN), eq("ip"))).thenReturn(true);

    interceptor.preHandle(request, response, new Object());
    verify(rateLimitingService).tryConsume(RateLimitPolicy.ADMIN, "ip");
  }

  @Test
  void preHandle_unrelatedUri_skipsRateLimit_returnsTrue() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/companies/123");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("ip");

    assertTrue(interceptor.preHandle(request, response, new Object()));
    verify(rateLimitingService, never())
        .tryConsume(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString());
  }

  // ── Block when denied ────────────────────────────────────────────────

  @Test
  void preHandle_denied_returns429_andFalse() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/auth/login");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("attacker");
    when(rateLimitingService.tryConsume(RateLimitPolicy.LOGIN, "attacker")).thenReturn(false);

    boolean result = interceptor.preHandle(request, response, new Object());

    assertFalse(result, "Phải block khi vượt rate limit");
    verify(response).sendError(eq(429), org.mockito.ArgumentMatchers.contains("quá nhiều"));
  }

  // ── IP extraction ────────────────────────────────────────────────────

  @Test
  void preHandle_xForwardedFor_singleIp_used() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/auth/login");
    when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.45");
    when(rateLimitingService.tryConsume(RateLimitPolicy.LOGIN, "203.0.113.45")).thenReturn(true);

    interceptor.preHandle(request, response, new Object());

    verify(rateLimitingService).tryConsume(RateLimitPolicy.LOGIN, "203.0.113.45");
  }

  @Test
  void preHandle_xForwardedFor_chainOfProxies_firstUsed() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/auth/login");
    when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100.1, 203.0.113.10, 10.0.0.1");
    when(rateLimitingService.tryConsume(RateLimitPolicy.LOGIN, "198.51.100.1")).thenReturn(true);

    interceptor.preHandle(request, response, new Object());

    verify(rateLimitingService).tryConsume(RateLimitPolicy.LOGIN, "198.51.100.1");
  }

  @Test
  void preHandle_noProxy_usesRemoteAddr() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/auth/login");
    when(request.getHeader("X-Forwarded-For")).thenReturn(null);
    when(request.getRemoteAddr()).thenReturn("127.0.0.1");
    when(rateLimitingService.tryConsume(RateLimitPolicy.LOGIN, "127.0.0.1")).thenReturn(true);

    interceptor.preHandle(request, response, new Object());

    verify(rateLimitingService).tryConsume(RateLimitPolicy.LOGIN, "127.0.0.1");
  }
}

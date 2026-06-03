package com.iting.jobportal.common.security;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * preHandle interceptor luôn return true (không chặn request), nhưng: - URI matches alias cũ → log
 * warn + 3 response headers (X-Deprecated-Path, X-Replacement-Path, Deprecation) - URI không match
 * → không set header gì - Match đầu tiên thắng (break sau khi tìm thấy)
 */
@ExtendWith(MockitoExtension.class)
class DeprecatedPathInterceptorTest {

  @Mock private HttpServletRequest request;
  @Mock private HttpServletResponse response;
  @InjectMocks private DeprecatedPathInterceptor interceptor;

  @Test
  void preHandle_employerJobs_setsDeprecationHeaders() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/employer/jobs/123");
    when(request.getMethod()).thenReturn("GET");

    boolean result = interceptor.preHandle(request, response, new Object());

    assertTrue(result, "Interceptor không được block request");
    verify(response).setHeader("X-Deprecated-Path", "/api/employer/jobs");
    verify(response).setHeader("X-Replacement-Path", "/api/hr/jobs");
    verify(response).setHeader("Deprecation", "true");
  }

  @Test
  void preHandle_employersCandidates_setsDeprecationHeaders() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/employers/candidates");
    when(request.getMethod()).thenReturn("POST");

    interceptor.preHandle(request, response, new Object());

    verify(response).setHeader("X-Deprecated-Path", "/api/employers/candidates");
    verify(response).setHeader("X-Replacement-Path", "/api/hr/candidates");
  }

  @Test
  void preHandle_companiesMe_setsDeprecationHeaders() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/companies/me");
    when(request.getMethod()).thenReturn("GET");

    interceptor.preHandle(request, response, new Object());

    verify(response).setHeader("X-Deprecated-Path", "/api/companies/me");
  }

  @Test
  void preHandle_unrelatedUri_setsNoHeaders() throws Exception {
    when(request.getRequestURI()).thenReturn("/api/jobs/123");

    boolean result = interceptor.preHandle(request, response, new Object());

    assertTrue(result);
    verify(response, never())
        .setHeader(
            org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString());
  }

  @Test
  void preHandle_subpathOfDeprecatedPrefix_stillMatches() throws Exception {
    // startsWith → /api/employer/jobs/foo/bar/baz vẫn match
    when(request.getRequestURI()).thenReturn("/api/employer/jobs/foo/bar/baz");
    when(request.getMethod()).thenReturn("DELETE");

    interceptor.preHandle(request, response, new Object());

    verify(response).setHeader("X-Deprecated-Path", "/api/employer/jobs");
  }

  @Test
  void preHandle_returnsTrue_evenWhenNoMatch() throws Exception {
    when(request.getRequestURI()).thenReturn("/health");

    assertTrue(interceptor.preHandle(request, response, new Object()));
  }
}

package com.iting.jobportal.common.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

  private final ExpressionParser parser = new SpelExpressionParser();

  @Autowired(required = false)
  private RedisRateLimitingService redisLimiter;

  @Autowired(required = false)
  private InMemoryRateLimiter localLimiter;

  @Around("@annotation(com.iting.jobportal.common.ratelimit.RateLimited)")
  public Object enforce(ProceedingJoinPoint pjp) throws Throwable {
    MethodSignature sig = (MethodSignature) pjp.getSignature();
    Method method = sig.getMethod();
    RateLimited annotation = method.getAnnotation(RateLimited.class);
    String subject = resolveSubject(annotation.subject(), pjp, sig);

    boolean allowed = tryConsume(annotation.policy(), subject);
    if (!allowed) {
      throw new ResponseStatusException(
          HttpStatus.TOO_MANY_REQUESTS,
          "Rate limit exceeded for " + annotation.policy() + " (subject=" + subject + ")");
    }
    return pjp.proceed();
  }

  private boolean tryConsume(RateLimitPolicy policy, String subject) {
    if (redisLimiter != null) return redisLimiter.tryConsume(policy, subject);
    if (localLimiter != null) return localLimiter.tryConsume(policy, subject);
    return true;
  }

  private String resolveSubject(String spec, ProceedingJoinPoint pjp, MethodSignature sig) {
    if (spec == null || spec.isBlank() || "ip".equalsIgnoreCase(spec)) return clientIp();
    if ("user".equalsIgnoreCase(spec))
      return Optional.ofNullable(currentUserId()).orElse(clientIp());

    StandardEvaluationContext ctx = new StandardEvaluationContext();
    String[] paramNames = sig.getParameterNames();
    Object[] args = pjp.getArgs();
    if (paramNames != null) {
      for (int i = 0; i < paramNames.length; i++) ctx.setVariable(paramNames[i], args[i]);
    }
    try {
      Expression expr = parser.parseExpression(spec);
      Object value = expr.getValue(ctx);
      return value != null ? value.toString() : clientIp();
    } catch (Exception e) {
      log.warn("Failed to evaluate rate-limit subject SpEL '{}': {}", spec, e.getMessage());
      return clientIp();
    }
  }

  private String clientIp() {
    HttpServletRequest req = currentRequest();
    if (req == null) return "anonymous";
    String fwd = req.getHeader("X-Forwarded-For");
    if (fwd != null && !fwd.isBlank()) return fwd.split(",")[0].trim();
    String real = req.getHeader("X-Real-IP");
    return (real != null && !real.isBlank()) ? real : req.getRemoteAddr();
  }

  private String currentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) return null;
    Object principal = auth.getPrincipal();
    return principal != null ? principal.toString() : null;
  }

  private HttpServletRequest currentRequest() {
    var attrs = RequestContextHolder.getRequestAttributes();
    return attrs instanceof ServletRequestAttributes sra ? sra.getRequest() : null;
  }
}

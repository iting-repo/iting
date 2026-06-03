package com.iting.jobportal.common.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Apply a {@link RateLimitPolicy} to a controller/service method. Subject is the client IP by
 * default; pass {@code subject = "user"} to bucket per authenticated principal id, or {@code
 * subject = "email:<spel>"} to bucket per request body field.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {
  RateLimitPolicy policy();

  /**
   * {@code "ip"} (default), {@code "user"}, or a SpEL expression evaluated against the method args.
   */
  String subject() default "ip";
}

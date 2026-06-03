package com.iting.jobportal.common.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import java.time.Duration;

public enum RateLimitPolicy {
  LOGIN(20, Duration.ofMinutes(1), FailMode.FAIL_CLOSED),
  OTP(5, Duration.ofMinutes(5), FailMode.FAIL_CLOSED),
  REGISTER(10, Duration.ofMinutes(1), FailMode.FAIL_CLOSED),
  REFRESH(10, Duration.ofMinutes(1), FailMode.FAIL_OPEN),
  APPLY_JOB(30, Duration.ofMinutes(10), FailMode.FAIL_OPEN),
  WITHDRAW_APP(5, Duration.ofMinutes(5), FailMode.FAIL_CLOSED),
  AI_REVIEW(15, Duration.ofMinutes(10), FailMode.FAIL_CLOSED),
    AI_CV_SCORE  (10, Duration.ofMinutes(10), FailMode.FAIL_CLOSED),
  FILE_UPLOAD(20, Duration.ofMinutes(10), FailMode.FAIL_OPEN),
  PUBLIC_SEARCH(60, Duration.ofMinutes(1), FailMode.FAIL_OPEN),
  ADMIN(60, Duration.ofMinutes(1), FailMode.FAIL_OPEN);

  public enum FailMode {
    /** Khi Redis + local fallback đều fail: chặn request (an toàn cho endpoint nhạy cảm). */
    FAIL_CLOSED,
    /** Khi Redis + local fallback đều fail: cho qua (tránh chặn oan endpoint ít nguy hiểm). */
    FAIL_OPEN
  }

  private final long capacity;
  private final Duration refillPeriod;
  private final FailMode failMode;

  RateLimitPolicy(long capacity, Duration refillPeriod, FailMode failMode) {
    this.capacity = capacity;
    this.refillPeriod = refillPeriod;
    this.failMode = failMode;
  }

  public BucketConfiguration toConfig() {
    Bandwidth bw = Bandwidth.classic(capacity, Refill.intervally(capacity, refillPeriod));
    return BucketConfiguration.builder().addLimit(bw).build();
  }

  public String key(String subject) {
    return "rl:" + name().toLowerCase() + ":" + subject;
  }

  public FailMode failMode() {
    return failMode;
  }
}

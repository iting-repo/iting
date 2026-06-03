package com.iting.jobportal.common.ratelimit;

import io.github.bucket4j.Bucket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * Per-instance in-memory rate limiter (Bucket4j local). Two roles:
 *
 * <ul>
 *   <li>Primary limiter khi {@code app.redis.enabled=false} (dev/test).
 *   <li>Fallback của {@link RedisRateLimitingService} khi circuit breaker mở (Redis hỏng).
 * </ul>
 *
 * State không share giữa các instance → trong fallback mode kẻ tấn công có thể đập từng pod, nhưng
 * vẫn chặn được spam đơn giản. Đây là đánh đổi có chủ đích so với fail-open hoàn toàn.
 */
@Service
public class InMemoryRateLimiter {

  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  public boolean tryConsume(RateLimitPolicy policy, String subject) {
    Bucket bucket =
        buckets.computeIfAbsent(
            policy.key(subject),
            k -> Bucket.builder().addLimit(policy.toConfig().getBandwidths()[0]).build());
    return bucket.tryConsume(1);
  }
}

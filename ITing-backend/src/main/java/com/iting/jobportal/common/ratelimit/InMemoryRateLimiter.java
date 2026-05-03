package com.iting.jobportal.common.ratelimit;

import io.github.bucket4j.Bucket;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fallback rate-limiter when Redis is off. State is per-instance only — fine for dev,
 * not for production multi-replica.
 */
@Service
@ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryRateLimiter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(RateLimitPolicy policy, String subject) {
        Bucket bucket = buckets.computeIfAbsent(
                policy.key(subject),
                k -> Bucket.builder().addLimit(policy.toConfig().getBandwidths()[0]).build());
        return bucket.tryConsume(1);
    }
}

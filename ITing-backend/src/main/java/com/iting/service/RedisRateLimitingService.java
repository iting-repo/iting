package com.iting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisRateLimitingService {

    private final StringRedisTemplate redisTemplate;

    private static final String RATE_LIMIT_KEY_PREFIX = "rate_limit:";
    private static final String LUA_SCRIPT = """
            local key = KEYS[1]
            local limit = tonumber(ARGV[1])
            local window = tonumber(ARGV[2])
            local current = tonumber(redis.call('get', key) or '0')
            if current >= limit then
                return 0
            end
            current = redis.call('incr', key)
            if current == 1 then
                redis.call('expire', key, window)
            end
            return 1
            """;

    private final DefaultRedisScript<Long> rateLimitScript = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);

    public boolean isAllowed(String identifier, String endpoint, int maxRequests, int windowSeconds) {
        String key = RATE_LIMIT_KEY_PREFIX + identifier + ":" + endpoint;
        try {
            Long result = redisTemplate.execute(
                    rateLimitScript,
                    Collections.singletonList(key),
                    String.valueOf(maxRequests),
                    String.valueOf(windowSeconds));
            return result != null && result == 1L;
        } catch (Exception e) {
            log.error("Rate limiting error for {}: {}", key, e.getMessage());
            return true; // Allow on error (fail open)
        }
    }

    public long getRemainingRequests(String identifier, String endpoint) {
        String key = RATE_LIMIT_KEY_PREFIX + identifier + ":" + endpoint;
        String count = redisTemplate.opsForValue().get(key);
        return count != null ? Long.parseLong(count) : 0;
    }

    public long getTTL(String identifier, String endpoint) {
        String key = RATE_LIMIT_KEY_PREFIX + identifier + ":" + endpoint;
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return ttl != null ? ttl : 0;
    }
}

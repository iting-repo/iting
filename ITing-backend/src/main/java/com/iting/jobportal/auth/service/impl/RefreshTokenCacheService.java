package com.iting.jobportal.auth.service.impl;

import com.iting.jobportal.auth.entity.RefreshToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Read-through cache for {@link RefreshToken} validation.
 * The DB stays the source of truth (revocation, rotation), but every refresh-flow
 * lookup hits Redis first to spare a JPA query on the hot auth path.
 *
 * Invalidation is explicit: callers MUST evict on revoke/markAsUsed.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "true")
@Slf4j
public class RefreshTokenCacheService {

    private static final String PREFIX = "iting:rt:";

    private final RedisTemplate<String, Object> redisTemplate;

    public void put(RefreshToken token) {
        if (token == null || token.getTokenId() == null) return;
        long ttl = Math.max(60, ttlSeconds(token));
        redisTemplate.opsForValue().set(key(token.getTokenId()), token, Duration.ofSeconds(ttl));
    }

    public RefreshToken get(String tokenId) {
        Object v = redisTemplate.opsForValue().get(key(tokenId));
        return v instanceof RefreshToken rt ? rt : null;
    }

    public void evict(String tokenId) {
        redisTemplate.delete(key(tokenId));
    }

    public void evictAllForUser(Long userId) {
        // Best-effort tag — pair with a per-user index set if you need O(1) revoke-all.
        redisTemplate.delete(userIndex(userId));
    }

    private String key(String tokenId) { return PREFIX + tokenId; }
    private String userIndex(Long userId) { return PREFIX + "u:" + userId; }

    private long ttlSeconds(RefreshToken t) {
        if (t.getExpiryDate() == null) return 600;
        long now = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
        long exp = t.getExpiryDate().toEpochSecond(ZoneOffset.UTC);
        return Math.max(0, exp - now);
    }
}

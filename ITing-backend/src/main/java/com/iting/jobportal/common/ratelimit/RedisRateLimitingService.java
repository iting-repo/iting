package com.iting.jobportal.common.ratelimit;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.ClientOptions;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.TimeoutOptions;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Distributed rate-limiter backed by Redis (bucket4j-redis + Lettuce).
 *
 * <p><b>Lớp 1 — HA:</b> hỗ trợ cả single-node và Redis Sentinel. Khi
 * {@code REDIS_SENTINEL_NODES} có giá trị → kết nối qua Sentinel với tên master
 * lấy từ {@code REDIS_SENTINEL_MASTER}; ngược lại fallback về single-node URI.
 *
 * <p><b>Lớp 2 — Fail policy:</b> mỗi lần gọi Redis được wrap trong try/catch
 * với command timeout ngắn (mặc định 300ms). Khi gặp N lỗi liên tiếp,
 * circuit breaker mở trong {@link #CIRCUIT_OPEN_MILLIS}ms → mọi request route
 * thẳng qua {@link InMemoryRateLimiter} (per-instance, không hoàn hảo nhưng
 * vẫn chặn được spam). Khi cả local fallback cũng fail, quyết định cuối cùng
 * theo {@link RateLimitPolicy#failMode()}: FAIL_CLOSED cho endpoint nhạy cảm,
 * FAIL_OPEN cho endpoint ít nguy hiểm.
 */
@Service
@ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "true")
@Slf4j
public class RedisRateLimitingService {

    @Value("${spring.data.redis.host:localhost}")
    private String host;
    @Value("${spring.data.redis.port:6379}")
    private int port;
    @Value("${spring.data.redis.password:}")
    private String password;

    @Value("${app.redis.sentinel.nodes:}")
    private String sentinelNodes;
    @Value("${app.redis.sentinel.master:mymaster}")
    private String sentinelMaster;

    @Value("${app.redis.command-timeout-ms:300}")
    private long commandTimeoutMs;

    private final InMemoryRateLimiter fallback;

    private RedisClient client;
    private StatefulRedisConnection<byte[], byte[]> connection;
    private ProxyManager<byte[]> proxyManager;

    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private volatile long circuitOpenUntilMillis = 0L;

    private static final int FAILURE_THRESHOLD = 5;
    private static final long CIRCUIT_OPEN_MILLIS = 30_000L;

    public RedisRateLimitingService(InMemoryRateLimiter fallback) {
        this.fallback = fallback;
    }

    @PostConstruct
    void init() {
        Duration cmdTimeout = Duration.ofMillis(commandTimeoutMs);
        RedisURI uri = buildRedisUri(cmdTimeout);

        client = RedisClient.create(uri);
        client.setOptions(ClientOptions.builder()
                .timeoutOptions(TimeoutOptions.enabled(cmdTimeout))
                .autoReconnect(true)
                .build());

        connection = client.connect(ByteArrayCodec.INSTANCE);
        proxyManager = LettuceBasedProxyManager.builderFor(connection)
                .withExpirationStrategy(
                        ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(30)))
                .build();

        if (sentinelNodes != null && !sentinelNodes.isBlank()) {
            log.info("RedisRateLimitingService initialized in SENTINEL mode (master={}, nodes={}, timeout={}ms)",
                    sentinelMaster, sentinelNodes, commandTimeoutMs);
        } else {
            log.info("RedisRateLimitingService initialized in STANDALONE mode ({}:{}, timeout={}ms)",
                    host, port, commandTimeoutMs);
        }
    }

    private RedisURI buildRedisUri(Duration cmdTimeout) {
        if (sentinelNodes != null && !sentinelNodes.isBlank()) {
            List<HostPort> nodes = parseSentinelNodes(sentinelNodes);
            if (nodes.isEmpty()) {
                throw new IllegalStateException("app.redis.sentinel.nodes is set but no valid host:port found");
            }
            RedisURI.Builder builder = RedisURI.Builder
                    .sentinel(nodes.get(0).host, nodes.get(0).port, sentinelMaster);
            for (int i = 1; i < nodes.size(); i++) {
                builder.withSentinel(nodes.get(i).host, nodes.get(i).port);
            }
            if (password != null && !password.isBlank()) {
                builder.withPassword(password.toCharArray());
            }
            return builder.withTimeout(cmdTimeout).build();
        }

        RedisURI.Builder builder = RedisURI.Builder.redis(host, port);
        if (password != null && !password.isBlank()) {
            builder.withPassword(password.toCharArray());
        }
        return builder.withTimeout(cmdTimeout).build();
    }

    private List<HostPort> parseSentinelNodes(String raw) {
        List<HostPort> out = new ArrayList<>();
        for (String token : raw.split(",")) {
            String trimmed = token.trim();
            if (trimmed.isEmpty()) continue;
            int colon = trimmed.lastIndexOf(':');
            if (colon <= 0 || colon == trimmed.length() - 1) {
                log.warn("Skipping malformed sentinel node entry: '{}'", trimmed);
                continue;
            }
            try {
                String h = trimmed.substring(0, colon);
                int p = Integer.parseInt(trimmed.substring(colon + 1));
                out.add(new HostPort(h, p));
            } catch (NumberFormatException e) {
                log.warn("Skipping sentinel node with non-numeric port: '{}'", trimmed);
            }
        }
        return out;
    }

    @PreDestroy
    void shutdown() {
        if (connection != null) connection.close();
        if (client != null) client.shutdown();
    }

    public boolean tryConsume(RateLimitPolicy policy, String subject) {
        return tryConsume(policy, subject, 1);
    }

    public boolean tryConsume(RateLimitPolicy policy, String subject, long tokens) {
        if (System.currentTimeMillis() < circuitOpenUntilMillis) {
            return fallbackOrFailMode(policy, subject, "circuit-open");
        }

        try {
            BucketConfiguration cfg = policy.toConfig();
            byte[] key = policy.key(subject).getBytes(StandardCharsets.UTF_8);
            Bucket bucket = proxyManager.builder().build(key, () -> cfg);
            boolean allowed = bucket.tryConsume(tokens);

            int prevFailures = consecutiveFailures.getAndSet(0);
            if (prevFailures > 0) {
                log.info("Redis rate-limit recovered after {} consecutive failures", prevFailures);
            }
            return allowed;
        } catch (Exception e) {
            int failures = consecutiveFailures.incrementAndGet();
            log.error("Redis rate-limit call failed (policy={}, subject={}, failures={}): {}",
                    policy, subject, failures, e.getMessage());

            if (failures >= FAILURE_THRESHOLD && System.currentTimeMillis() >= circuitOpenUntilMillis) {
                circuitOpenUntilMillis = System.currentTimeMillis() + CIRCUIT_OPEN_MILLIS;
                log.warn("Redis rate-limit circuit OPEN for {}ms (threshold={} hit)",
                        CIRCUIT_OPEN_MILLIS, FAILURE_THRESHOLD);
            }
            return fallbackOrFailMode(policy, subject, "redis-exception");
        }
    }

    private boolean fallbackOrFailMode(RateLimitPolicy policy, String subject, String cause) {
        try {
            boolean allowed = fallback.tryConsume(policy, subject);
            log.debug("Rate-limit served by local fallback (policy={}, cause={}, allowed={})",
                    policy, cause, allowed);
            return allowed;
        } catch (Exception fallbackEx) {
            boolean failOpen = policy.failMode() == RateLimitPolicy.FailMode.FAIL_OPEN;
            log.error("Local fallback also failed for policy={} → applying {} (cause={}): {}",
                    policy, policy.failMode(), cause, fallbackEx.getMessage());
            return failOpen;
        }
    }

    private record HostPort(String host, int port) {}
}

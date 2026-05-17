package com.iting.jobportal.common.ratelimit;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Distributed rate-limiter backed by Redis (bucket4j-redis 8.1 + Lettuce).
 * Survives restart and works across multiple app instances.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "true")
@Slf4j
public class RedisRateLimitingService {

    @Value("${spring.data.redis.host:localhost}")
    private String host;
    @Value("${spring.data.redis.port:6379}")
    private int port;
    @Value("${spring.data.redis.password:}")
    private String password;

    private RedisClient client;
    private StatefulRedisConnection<byte[], byte[]> connection;
    private ProxyManager<byte[]> proxyManager;

    @PostConstruct
    void init() {
        String url = password.isBlank()
                ? "redis://" + host + ":" + port
                : "redis://:" + password + "@" + host + ":" + port;
        client = RedisClient.create(url);
        connection = client.connect(ByteArrayCodec.INSTANCE);
        proxyManager = LettuceBasedProxyManager.builderFor(connection)
                .withExpirationStrategy(
                        ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(30)))
                .build();
        log.info("RedisRateLimitingService initialized at {}:{}", host, port);
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
        BucketConfiguration cfg = policy.toConfig();
        byte[] key = policy.key(subject).getBytes(StandardCharsets.UTF_8);
        Bucket bucket = proxyManager.builder().build(key, () -> cfg);
        return bucket.tryConsume(tokens);
    }
}

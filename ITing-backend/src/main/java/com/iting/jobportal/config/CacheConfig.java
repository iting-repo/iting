package com.iting.jobportal.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.iting.jobportal.common.cache.CacheNames;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${app.cache.default-ttl:300}")
    private long defaultTtl;
    @Value("${app.cache.job-list-ttl:120}")
    private long jobListTtl;
    @Value("${app.cache.recommendation-ttl:180}")
    private long recommendationTtl;
    @Value("${app.cache.embedding-ttl:86400}")
    private long embeddingTtl;
    @Value("${app.cache.static-content-ttl:3600}")
    private long staticTtl;
    @Value("${app.cache.caffeine.max-size:10000}")
    private long caffeineMaxSize;

    /**
     * L1: Caffeine. Always available, even when Redis is off.
     * Used as fallback in non-clustered dev or when Redis is not provisioned.
     */
    @Bean
    @ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "false", matchIfMissing = true)
    public CacheManager caffeineCacheManager() {
        CaffeineCacheManager mgr = new CaffeineCacheManager(
                CacheNames.JOB_LIST, CacheNames.JOB_DETAIL, CacheNames.RECOMMENDATION,
                CacheNames.JOB_EMBEDDING, CacheNames.STATIC_CONTENT, CacheNames.COMPANY_DETAIL,
                CacheNames.CATEGORY_TREE, CacheNames.KNOWLEDGE_GRAPH);
        mgr.setCaffeine(Caffeine.newBuilder()
                .maximumSize(caffeineMaxSize)
                .expireAfterWrite(defaultTtl, TimeUnit.SECONDS)
                .recordStats());
        return mgr;
    }

    /**
     * L2: Redis. Primary when Redis is enabled. Per-cache TTL.
     * Pair with a small Caffeine in front of hot reads if needed (CompositeCacheManager not used here
     * because Spring Cache lookup picks the first hit; we keep Redis as the single distributed source of truth
     * and rely on JVM-level memoization at call site for hottest paths).
     */
    @Bean
    @Primary
    @ConditionalOnProperty(prefix = "app.redis", name = "enabled", havingValue = "true")
    public CacheManager redisCacheManager(RedisConnectionFactory cf,
                                          GenericJackson2JsonRedisSerializer redisJsonSerializer) {
        GenericJackson2JsonRedisSerializer valSer = redisJsonSerializer;

        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(defaultTtl))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(valSer))
                .prefixCacheNameWith("iting:cache:");

        Map<String, RedisCacheConfiguration> perCache = new HashMap<>();
        perCache.put(CacheNames.JOB_LIST, base.entryTtl(Duration.ofSeconds(jobListTtl)));
        perCache.put(CacheNames.JOB_DETAIL, base.entryTtl(Duration.ofSeconds(jobListTtl)));
        perCache.put(CacheNames.RECOMMENDATION, base.entryTtl(Duration.ofSeconds(recommendationTtl)));
        perCache.put(CacheNames.JOB_EMBEDDING, base.entryTtl(Duration.ofSeconds(embeddingTtl)));
        perCache.put(CacheNames.STATIC_CONTENT, base.entryTtl(Duration.ofSeconds(staticTtl)));
        perCache.put(CacheNames.COMPANY_DETAIL, base.entryTtl(Duration.ofSeconds(staticTtl)));
        perCache.put(CacheNames.CATEGORY_TREE, base.entryTtl(Duration.ofSeconds(staticTtl)));
        perCache.put(CacheNames.KNOWLEDGE_GRAPH, base.entryTtl(Duration.ofSeconds(staticTtl)));

        return RedisCacheManager.builder(cf)
                .cacheDefaults(base)
                .withInitialCacheConfigurations(perCache)
                .transactionAware()
                .build();
    }
}

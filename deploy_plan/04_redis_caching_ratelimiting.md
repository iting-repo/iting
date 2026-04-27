# Task 04: Redis Caching & Rate Limiting

## Objective

Set up Redis as a Docker container for caching and rate limiting, then migrate the backend from Bucket4j (in-memory) to Redis-based rate limiting. Redis will also serve as a session cache and general-purpose cache.

## Prerequisites

- Task 02 completed (Docker foundation, iting-net network, volumes created)
- Task 03 completed (RDS PostgreSQL configured)
- Backend code uses Bucket4j for rate limiting (see `ITing-backend/build.gradle`)

## Step-by-Step Instructions

### 4.1 Create Redis Configuration

```bash
# SSH into EC2
ssh -i iting-key-pair.pem ubuntu@$PUBLIC_IP

cat > /opt/iting/config/redis/redis.conf << 'EOF'
# ITing Redis Configuration
# Reference: https://redis.io/docs/manual/config/

# Network
bind 0.0.0.0
port 6379
protected-mode yes
requirepass ${REDIS_PASSWORD}

# Memory & Performance
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (AOF for durability)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Timeout
timeout 300
tcp-keepalive 60

# Logging
loglevel notice

# Connection limits
maxclients 256

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
EOF

# Set secure permissions
chmod 640 /opt/iting/config/redis/redis.conf
```

### 4.2 Add Redis Service to docker-compose.yml

```bash
cat >> /opt/iting/docker-compose.yml << 'COMPOSEEOF'

  # ========================================
  # Redis - Caching & Rate Limiting
  # ========================================
  redis:
    image: redis:7-alpine
    container_name: iting-redis
    restart: unless-stopped
    networks:
      - iting-net
    ports:
      - "6379:6379"
    volumes:
      - iting_redis_data:/data
      - ./config/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    command: redis-server /usr/local/etc/redis/redis.conf --requirepass ${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 64M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
COMPOSEEOF
```

### 4.3 Start Redis and Verify

```bash
cd /opt/iting

# Start Redis only
docker compose --env-file .env up -d redis

# Wait for Redis to be ready
sleep 5

# Verify Redis is running
docker compose --env-file .env ps redis

# Test Redis connection
source /opt/iting/.env
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" ping
# Expected: PONG

# Test Redis info
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" info server | head -5

# Test setting a key
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" SET test:key "hello-iting"
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" GET test:key
# Expected: "hello-iting"

# Clean up test key
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" DEL test:key
```

### 4.4 Add Spring Data Redis Dependencies to Backend

Edit `ITing-backend/build.gradle` to add Redis dependencies:

```gradle
// Add to dependencies section in build.gradle:

// Redis
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
implementation 'org.springframework.data:spring-data-redis'

// Remove Bucket4j (will be replaced by Redis-based rate limiting)
// implementation 'com.bucket4j:bucket4j-core:8.1.0'  // REMOVE THIS LINE
```

### 4.5 Create Redis Configuration Class

Create `ITing-backend/src/main/java/com/iting/config/RedisConfig.java`:

```java
package com.iting.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host:redis}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);
        config.setPassword(redisPassword);
        return new LettuceConnectionFactory(config);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }
}
```

### 4.6 Create Redis Rate Limiting Service

Create `ITing-backend/src/main/java/com/iting/service/RedisRateLimitingService.java`:

```java
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
                    String.valueOf(windowSeconds)
            );
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
```

### 4.7 Create Rate Limiting Interceptor

Create `ITing-backend/src/main/java/com/iting/config/RateLimitingInterceptor.java`:

```java
package com.iting.config;

import com.iting.service.RedisRateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final RedisRateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String clientIp = getClientIp(request);
        String endpoint = request.getRequestURI();

        int maxRequests = getMaxRequests(endpoint);
        int windowSeconds = 60;

        boolean allowed = rateLimitingService.isAllowed(clientIp, endpoint, maxRequests, windowSeconds);

        if (!allowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("Retry-After", String.valueOf(
                    rateLimitingService.getTTL(clientIp, endpoint)));
            log.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIp, endpoint);
            return false;
        }

        long remaining = maxRequests - rateLimitingService.getRemainingRequests(clientIp, endpoint);
        response.setHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, remaining)));

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim();
    }

    private int getMaxRequests(String endpoint) {
        if (endpoint.startsWith("/api/auth/login")) return 5;
        if (endpoint.startsWith("/api/auth/register")) return 3;
        if (endpoint.startsWith("/api/")) return 100;
        return 200;
    }
}
```

### 4.8 Register Interceptor in WebMvcConfig

Add to `ITing-backend/src/main/java/com/iting/config/WebMvcConfig.java` (or create it):

```java
// Add this method to your WebMvcConfigurer implementation:

@Bean
public RateLimitingInterceptor rateLimitingInterceptor() {
    return new RateLimitingInterceptor(redisRateLimitingService);
}

@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(rateLimitingInterceptor())
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/actuator/**");
}
```

### 4.9 Add Redis Properties to application-prod.properties

Create or update `ITing-backend/src/main/resources/application-prod.properties`:

```properties
# Redis Configuration
spring.data.redis.host=${REDIS_HOST:redis}
spring.data.redis.port=${REDIS_PORT:6379}
spring.data.redis.password=${REDIS_PASSWORD}
spring.data.redis.timeout=5000ms
spring.data.redis.lettuce.pool.max-active=8
spring.data.redis.lettuce.pool.max-idle=8
spring.data.redis.lettuce.pool.min-idle=2

# Cache Configuration
spring.cache.type=redis
spring.cache.redis.time-to-live=30m
spring.cache.redis.cache-null-values=false

# Rate Limiting (used by RedisRateLimitingService)
iting.rate-limit.enabled=true
iting.rate-limit.default-max-requests=100
iting.rate-limit.default-window-seconds=60
```

### 4.10 Remove Bucket4j Dependency

```bash
# In ITing-backend/build.gradle, remove:
# implementation 'com.bucket4j:bucket4j-core:8.1.0'

# Search for any files using Bucket4j and migrate them:
# grep -r "bucket4j" ITing-backend/src/ --include="*.java"
# Replace all Bucket4j usages with RedisRateLimitingService
```

### 4.11 Add Redis Environment Variables to Backend Docker Service

These will be added to the backend service definition in Task 07:

```yaml
# In docker-compose.yml backend service (Task 07):
environment:
  SPRING_DATA_REDIS_HOST: redis
  SPRING_DATA_REDIS_PORT: 6379
  SPRING_DATA_REDIS_PASSWORD: ${REDIS_PASSWORD}
  SPRING_CACHE_TYPE: redis
```

## Verification

```bash
# Verify Redis container is running
docker compose --env-file .env ps redis

# Test Redis connection
source /opt/iting/.env
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" ping
# Expected: PONG

# Test Redis persistence
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" SET test:persist "redis-works"
docker restart iting-redis
sleep 5
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" GET test:persist
# Expected: "redis-works"

# Clean up
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" DEL test:persist

# Verify Redis memory usage
docker exec iting-redis redis-cli -a "$REDIS_PASSWORD" info memory | grep used_memory_human
# Expected: ~low MB range

# After backend deployment (Task 07), verify rate limiting:
# curl -X POST https://api.iting.vn/api/auth/login (5 times rapidly)
# Should get 429 Too Many Requests on 6th attempt
```

## Rollback

```bash
# Stop and remove Redis container
docker compose --env-file .env down redis

# Remove Redis volume (destructive - loses all cached data)
docker volume rm iting_redis_data

# Revert backend code changes:
# 1. Re-add Bucket4j dependency to build.gradle
# 2. Remove RedisConfig.java, RedisRateLimitingService.java, RateLimitingInterceptor.java
# 3. Revert WebMvcConfig changes
# 4. Remove Redis properties from application-prod.properties
```

## References

- `ITing-backend/build.gradle` - Current dependencies (includes Bucket4j)
- `ITing-backend/src/main/java/` - Source code for rate limiting migration
- `.opencode/skills/monitoring-observability/skills/SKILL.md` - Redis monitoring with Prometheus
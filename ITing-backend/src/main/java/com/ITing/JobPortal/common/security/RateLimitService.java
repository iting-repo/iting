package com.iting.jobportal.common.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Login: 5 requests per 10 minutes
    public Bucket resolveLoginBucket(String ip) {
        return buckets.computeIfAbsent("login-" + ip, k -> 
            Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(10))))
                .build()
        );
    }

    // Register: 3 requests per hour
    public Bucket resolveRegisterBucket(String ip) {
        return buckets.computeIfAbsent("register-" + ip, k -> 
            Bucket.builder()
                .addLimit(Bandwidth.classic(3, Refill.intervally(3, Duration.ofHours(1))))
                .build()
        );
    }

    // Refresh Token: 10 requests per minute
    public Bucket resolveRefreshBucket(String ip) {
        return buckets.computeIfAbsent("refresh-" + ip, k -> 
            Bucket.builder()
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
                .build()
        );
    }

    // Public Search: 30 requests per minute
    public Bucket resolveSearchBucket(String ip) {
        return buckets.computeIfAbsent("search-" + ip, k -> 
            Bucket.builder()
                .addLimit(Bandwidth.classic(30, Refill.intervally(30, Duration.ofMinutes(1))))
                .build()
        );
    }

    // Admin APIs: 20 requests per minute
    public Bucket resolveAdminBucket(String ip) {
        return buckets.computeIfAbsent("admin-" + ip, k -> 
            Bucket.builder()
                .addLimit(Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1))))
                .build()
        );
    }
}

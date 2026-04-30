package com.iting.jobportal.common.ratelimit;

import com.iting.jobportal.auth.entity.Account;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    // Lưu trữ Bucket trong bộ nhớ (Cho hệ thống 1 server).
    // Nếu scaling nhiều server, bạn cần dùng RedisBucket4j.
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // Cài đặt luật: 1 request / 5 phút (300 giây)
    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, this::newBucket);
    }

    private Bucket newBucket(String key) {
        Refill refill = Refill.intervally(1, Duration.ofMinutes(5));
        Bandwidth limit = Bandwidth.classic(1, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}

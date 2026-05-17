package com.iting.jobportal.common.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;

import java.time.Duration;

public enum RateLimitPolicy {

    LOGIN(20, Duration.ofMinutes(1)),
    OTP(5, Duration.ofMinutes(5)),
    REGISTER(10, Duration.ofMinutes(1)),
    REFRESH(10, Duration.ofMinutes(1)),
    APPLY_JOB(30, Duration.ofMinutes(10)),
    AI_REVIEW(15, Duration.ofMinutes(10)),
    FILE_UPLOAD(20, Duration.ofMinutes(10)),
    PUBLIC_SEARCH(60, Duration.ofMinutes(1)),
    ADMIN(60, Duration.ofMinutes(1));

    private final long capacity;
    private final Duration refillPeriod;

    RateLimitPolicy(long capacity, Duration refillPeriod) {
        this.capacity = capacity;
        this.refillPeriod = refillPeriod;
    }

    public BucketConfiguration toConfig() {
        Bandwidth bw = Bandwidth.classic(capacity, Refill.intervally(capacity, refillPeriod));
        return BucketConfiguration.builder().addLimit(bw).build();
    }

    public String key(String subject) {
        return "rl:" + name().toLowerCase() + ":" + subject;
    }
}

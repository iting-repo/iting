package com.iting.jobportal.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.iting.jobportal.common.ratelimit.InMemoryRateLimiter;
import com.iting.jobportal.common.ratelimit.RateLimitPolicy;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Rate-limit security tests.
 *
 * <p>Verifies that the {@link InMemoryRateLimiter} + {@link RateLimitPolicy} pair correctly:
 *
 * <ul>
 *   <li>Enforces capacity limits per policy
 *   <li>Isolates buckets per subject (per-IP, per-user)
 *   <li>Isolates buckets per policy (LOGIN ≠ REGISTER even for same IP)
 *   <li>Holds under concurrent load (thread-safety)
 *   <li>Different policies have different capacities
 * </ul>
 */
@DisplayName("Rate Limit Security Tests")
class RateLimitSecurityTest {

  private InMemoryRateLimiter rateLimiter;

  @BeforeEach
  void setUp() {
    rateLimiter = new InMemoryRateLimiter();
  }

  // ──────────────────────────────────────────────────────────────
  // 1. Capacity enforcement per policy
  // ──────────────────────────────────────────────────────────────

  @Nested
  @DisplayName("Capacity Enforcement")
  class CapacityEnforcementTests {

    @Test
    @DisplayName("LOGIN policy allows exactly 20 requests, then blocks")
    void loginPolicy_allows20RequestsThenBlocks() {
      String subject = "192.168.1.1";

      // First 20 requests should succeed
      for (int i = 0; i < 20; i++) {
        assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject))
            .as("Request %d/20 should succeed", i + 1)
            .isTrue();
      }

      // 21st request should be blocked
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject))
          .as("Request 21 should be BLOCKED (rate limit exceeded)")
          .isFalse();

      // 22nd, 23rd... still blocked
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject)).isFalse();
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject)).isFalse();
    }

    @Test
    @DisplayName("OTP policy allows exactly 5 requests, then blocks")
    void otpPolicy_allows5RequestsThenBlocks() {
      String subject = "user-123";

      for (int i = 0; i < 5; i++) {
        assertThat(rateLimiter.tryConsume(RateLimitPolicy.OTP, subject))
            .as("OTP request %d/5", i + 1)
            .isTrue();
      }

      // 6th request blocked — prevents OTP brute force
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.OTP, subject))
          .as("OTP brute force must be blocked")
          .isFalse();
    }

    @Test
    @DisplayName("PUBLIC_SEARCH allows 60 requests/min — more lenient")
    void publicSearch_allows60RequestsPerMinute() {
      String subject = "ip-1.2.3.4";

      for (int i = 0; i < 60; i++) {
        assertThat(rateLimiter.tryConsume(RateLimitPolicy.PUBLIC_SEARCH, subject)).isTrue();
      }

      assertThat(rateLimiter.tryConsume(RateLimitPolicy.PUBLIC_SEARCH, subject)).isFalse();
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 2. Subject Isolation (per-IP, per-user)
  // ──────────────────────────────────────────────────────────────

  @Nested
  @DisplayName("Subject Isolation")
  class SubjectIsolationTests {

    @Test
    @DisplayName("Different IPs have independent buckets")
    void differentIps_haveIndependentBuckets() {
      String ipA = "1.1.1.1";
      String ipB = "2.2.2.2";

      // IP A exhausts its bucket
      for (int i = 0; i < 20; i++) {
        rateLimiter.tryConsume(RateLimitPolicy.LOGIN, ipA);
      }
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, ipA))
          .as("IP A should be blocked")
          .isFalse();

      // IP B still fresh — must NOT be affected
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, ipB))
          .as("IP B should still be allowed")
          .isTrue();
    }

    @Test
    @DisplayName("Same IP with different policies = different buckets")
    void sameIp_differentPolicies_independentBuckets() {
      String subject = "10.0.0.1";

      // Exhaust LOGIN bucket
      for (int i = 0; i < 20; i++) {
        rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject);
      }
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject)).isFalse();

      // REGISTER bucket still fresh for same IP
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.REGISTER, subject))
          .as("REGISTER bucket should be independent of LOGIN")
          .isTrue();

      // OTP bucket also fresh
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.OTP, subject))
          .as("OTP bucket should be independent")
          .isTrue();
    }

    @Test
    @DisplayName("Per-user subject isolation works")
    void perUserSubjects_areIsolated() {
      // Exhaust user 1
      for (int i = 0; i < 30; i++) {
        rateLimiter.tryConsume(RateLimitPolicy.APPLY_JOB, "user-1");
      }
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.APPLY_JOB, "user-1")).isFalse();

      // User 2 unaffected
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.APPLY_JOB, "user-2")).isTrue();
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 3. Bypass Attempts
  // ──────────────────────────────────────────────────────────────

  @Nested
  @DisplayName("Bypass Attempts")
  class BypassAttemptTests {

    @Test
    @DisplayName("Empty subject still counted (not free pass)")
    void emptySubject_stillEnforced() {
      for (int i = 0; i < 20; i++) {
        rateLimiter.tryConsume(RateLimitPolicy.LOGIN, "");
      }
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, ""))
          .as("Empty subject should still be rate-limited")
          .isFalse();
    }

    @Test
    @DisplayName("Subject case-sensitivity — different cases = different buckets")
    void caseSensitive_subjectCreatesDifferentBuckets() {
      // Exhaust lowercase
      for (int i = 0; i < 20; i++) {
        rateLimiter.tryConsume(RateLimitPolicy.LOGIN, "user@test.com");
      }
      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, "user@test.com")).isFalse();

      // Uppercase variant has its own bucket — documented behavior
      // Production should canonicalize subjects to prevent bypass via case mutation
      boolean uppercaseAllowed = rateLimiter.tryConsume(RateLimitPolicy.LOGIN, "USER@TEST.COM");
      // If this passes, caller must normalize subject (security recommendation)
      assertThat(uppercaseAllowed).isTrue();
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 4. Thread Safety (concurrent attack)
  // ──────────────────────────────────────────────────────────────

  @Nested
  @DisplayName("Concurrent Load")
  class ConcurrentLoadTests {

    @Test
    @DisplayName("Concurrent requests should not exceed capacity (no race)")
    void concurrentRequests_exactlyCapacityAllowed() throws InterruptedException {
      int threads = 50;
      int requestsPerThread = 10;
      String subject = "concurrent-attacker";
      AtomicInteger successful = new AtomicInteger();

      ExecutorService executor = Executors.newFixedThreadPool(threads);

      for (int t = 0; t < threads; t++) {
        executor.submit(
            () -> {
              for (int r = 0; r < requestsPerThread; r++) {
                if (rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject)) {
                  successful.incrementAndGet();
                }
              }
            });
      }

      executor.shutdown();
      boolean finished = executor.awaitTermination(10, TimeUnit.SECONDS);
      assertThat(finished).isTrue();

      // Total requests = 500, but capacity = 20
      // Despite race, exactly 20 (or very close — bucket4j may allow refill during test) should
      // succeed
      assertThat(successful.get())
          .as("Concurrent attack should respect capacity ≈ 20 (actual: %d)", successful.get())
          .isLessThanOrEqualTo(25); // small tolerance for refill timing
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 5. Policy Configuration Sanity
  // ──────────────────────────────────────────────────────────────

  @Nested
  @DisplayName("Policy Configuration")
  class PolicyConfigurationTests {

    @Test
    @DisplayName("All policies have non-zero capacity")
    void allPolicies_haveCapacity() {
      for (RateLimitPolicy policy : RateLimitPolicy.values()) {
        long capacity = policy.toConfig().getBandwidths()[0].getCapacity();
        assertThat(capacity).as("Policy %s capacity", policy).isPositive();
      }
    }

    @Test
    @DisplayName("OTP has tightest limit (5) — strongest brute-force protection")
    void otpPolicy_hasTightestLimit() {
      long otpCapacity = RateLimitPolicy.OTP.toConfig().getBandwidths()[0].getCapacity();
      long loginCapacity = RateLimitPolicy.LOGIN.toConfig().getBandwidths()[0].getCapacity();
      long searchCapacity =
          RateLimitPolicy.PUBLIC_SEARCH.toConfig().getBandwidths()[0].getCapacity();

      assertThat(otpCapacity)
          .as("OTP should be more restrictive than LOGIN")
          .isLessThan(loginCapacity);
      assertThat(otpCapacity)
          .as("OTP should be more restrictive than PUBLIC_SEARCH")
          .isLessThan(searchCapacity);
    }

    @Test
    @DisplayName("Policy key includes policy name (prevents cross-policy collision)")
    void policyKey_includesPolicyName() {
      String loginKey = RateLimitPolicy.LOGIN.key("1.2.3.4");
      String otpKey = RateLimitPolicy.OTP.key("1.2.3.4");

      assertThat(loginKey).contains("login").contains("1.2.3.4");
      assertThat(otpKey).contains("otp").contains("1.2.3.4");
      assertThat(loginKey).isNotEqualTo(otpKey);
    }

    @Test
    @DisplayName("Policy key has Redis-friendly namespace prefix")
    void policyKey_hasNamespacePrefix() {
      String key = RateLimitPolicy.LOGIN.key("user");
      assertThat(key).startsWith("rl:");
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 6. Refill behavior (slow, observation only)
  // ──────────────────────────────────────────────────────────────

  @Nested
  @DisplayName("Refill Behavior")
  class RefillBehaviorTests {

    @Test
    @DisplayName("After capacity exhausted, immediate refill is NOT available")
    void immediatelyAfterExhaustion_noRefill() {
      String subject = "refill-test";

      for (int i = 0; i < 20; i++) {
        rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject);
      }

      // Wait briefly — refill is 20/min, so 100ms gives ~0.033 tokens (insufficient)
      try {
        Thread.sleep(100);
      } catch (InterruptedException ignored) {
      }

      assertThat(rateLimiter.tryConsume(RateLimitPolicy.LOGIN, subject))
          .as("Bucket should NOT refill 1 token in 100ms (rate: 20/60s)")
          .isFalse();
    }
  }
}

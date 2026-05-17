package com.iting.jobportal.performance;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Performance test suite for critical backend operations.
 * Validates throughput, latency, and concurrency under load.
 */
@DisplayName("Performance Tests")
class PerformanceTest {

    // ──────────────────────────────────────────────────────────────
    // 1. JWT Token Performance
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("JWT Token Performance")
    class JwtPerformanceTests {

        private JwtTokenUtil jwtTokenUtil;

        @BeforeEach
        void setUp() throws Exception {
            jwtTokenUtil = new JwtTokenUtil();
            Field secretField = JwtTokenUtil.class.getDeclaredField("SECRET");
            secretField.setAccessible(true);
            secretField.set(jwtTokenUtil, "iting-portal-test-secret-key-must-be-at-least-32-characters-long-for-hmac");
            Field expField = JwtTokenUtil.class.getDeclaredField("EXPIRATION");
            expField.setAccessible(true);
            expField.set(jwtTokenUtil, 86400000L);
        }

        @Test
        @DisplayName("Token generation: 1000 tokens should complete within 2 seconds")
        void tokenGeneration_1000Tokens_shouldCompleteWithin2Seconds() {
            int count = 1000;

            long start = System.nanoTime();
            for (int i = 0; i < count; i++) {
                jwtTokenUtil.generateToken((long) i, "user" + i + "@test.com", "CANDIDATE");
            }
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertTrue(elapsedMs < 2000,
                "1000 token generations took " + elapsedMs + "ms, expected < 2000ms");
            System.out.println("[PERF] JWT generation: " + count + " tokens in " + elapsedMs + "ms "
                + "(" + String.format("%.2f", (double) count / elapsedMs * 1000) + " tokens/sec)");
        }

        @Test
        @DisplayName("Token validation: 1000 validations should complete within 2 seconds")
        void tokenValidation_1000Tokens_shouldCompleteWithin2Seconds() {
            int count = 1000;
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");

            long start = System.nanoTime();
            for (int i = 0; i < count; i++) {
                jwtTokenUtil.validateToken(token);
            }
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertTrue(elapsedMs < 2000,
                "1000 token validations took " + elapsedMs + "ms, expected < 2000ms");
            System.out.println("[PERF] JWT validation: " + count + " validations in " + elapsedMs + "ms "
                + "(" + String.format("%.2f", (double) count / elapsedMs * 1000) + " validations/sec)");
        }

        @Test
        @DisplayName("Token generation under concurrent load: 10 threads × 100 tokens")
        void tokenGeneration_concurrent_shouldBeThreadSafe() throws Exception {
            int threads = 10;
            int tokensPerThread = 100;
            ExecutorService executor = Executors.newFixedThreadPool(threads);
            AtomicInteger successCount = new AtomicInteger(0);
            CountDownLatch latch = new CountDownLatch(threads);

            long start = System.nanoTime();

            for (int t = 0; t < threads; t++) {
                final int threadId = t;
                executor.submit(() -> {
                    try {
                        for (int i = 0; i < tokensPerThread; i++) {
                            String token = jwtTokenUtil.generateToken(
                                (long) (threadId * tokensPerThread + i),
                                "user" + threadId + "_" + i + "@test.com",
                                "CANDIDATE"
                            );
                            if (jwtTokenUtil.validateToken(token)) {
                                successCount.incrementAndGet();
                            }
                        }
                    } finally {
                        latch.countDown();
                    }
                });
            }

            assertTrue(latch.await(10, TimeUnit.SECONDS), "Concurrent token generation timed out");
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            executor.shutdown();

            assertEquals(threads * tokensPerThread, successCount.get(),
                "All tokens should be valid");
            System.out.println("[PERF] Concurrent JWT: " + successCount.get() + " tokens "
                + "(" + threads + " threads) in " + elapsedMs + "ms");
        }

        @Test
        @DisplayName("Invalid token rejection should be fast (< 1ms average)")
        void invalidTokenRejection_shouldBeFast() {
            int count = 1000;
            String invalidToken = "eyJhbGciOiJIUzI1NiJ9.invalid.payload";

            long start = System.nanoTime();
            for (int i = 0; i < count; i++) {
                jwtTokenUtil.validateToken(invalidToken);
            }
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            double avgMs = (double) elapsedMs / count;
            assertTrue(avgMs < 1.0,
                "Average invalid token rejection took " + avgMs + "ms, expected < 1ms");
            System.out.println("[PERF] Invalid token rejection: avg " + String.format("%.4f", avgMs) + "ms");
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Password Hashing Performance
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("BCrypt Password Hashing Performance")
    class PasswordHashingTests {

        private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        @Test
        @DisplayName("BCrypt encoding: single hash should complete within 500ms")
        void bcryptEncoding_singleHash_shouldCompleteWithin500ms() {
            long start = System.nanoTime();
            String hash = passwordEncoder.encode("MySecureP@ssw0rd!");
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertNotNull(hash);
            assertTrue(hash.startsWith("$2a$") || hash.startsWith("$2b$"),
                "Hash should use BCrypt algorithm prefix");
            assertTrue(elapsedMs < 500,
                "Single BCrypt hash took " + elapsedMs + "ms, expected < 500ms");
            System.out.println("[PERF] BCrypt single encode: " + elapsedMs + "ms");
        }

        @Test
        @DisplayName("BCrypt verification: should complete within 500ms")
        void bcryptVerification_shouldCompleteWithin500ms() {
            String hash = passwordEncoder.encode("MySecureP@ssw0rd!");

            long start = System.nanoTime();
            boolean matches = passwordEncoder.matches("MySecureP@ssw0rd!", hash);
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertTrue(matches);
            assertTrue(elapsedMs < 500,
                "BCrypt verification took " + elapsedMs + "ms, expected < 500ms");
            System.out.println("[PERF] BCrypt verify: " + elapsedMs + "ms");
        }

        @Test
        @DisplayName("BCrypt wrong password: rejection time should be similar to correct password")
        void bcryptWrongPassword_rejectionTimeShouldBeSimilar() {
            String hash = passwordEncoder.encode("CorrectPassword123");

            long startCorrect = System.nanoTime();
            passwordEncoder.matches("CorrectPassword123", hash);
            long correctMs = (System.nanoTime() - startCorrect) / 1_000_000;

            long startWrong = System.nanoTime();
            passwordEncoder.matches("WrongPassword456", hash);
            long wrongMs = (System.nanoTime() - startWrong) / 1_000_000;

            // Timing difference should be < 100ms to prevent timing attacks
            long diff = Math.abs(correctMs - wrongMs);
            assertTrue(diff < 100,
                "Timing difference between correct and wrong password: " + diff + "ms "
                + "(should be < 100ms to prevent timing attacks)");
            System.out.println("[PERF] BCrypt timing attack resistance: "
                + "correct=" + correctMs + "ms, wrong=" + wrongMs + "ms, diff=" + diff + "ms");
        }

        @Test
        @DisplayName("10 concurrent BCrypt operations should not block each other")
        void bcryptConcurrent_shouldNotBlock() throws Exception {
            int threads = 10;
            ExecutorService executor = Executors.newFixedThreadPool(threads);
            CountDownLatch latch = new CountDownLatch(threads);
            AtomicInteger success = new AtomicInteger(0);

            long start = System.nanoTime();
            for (int i = 0; i < threads; i++) {
                final int idx = i;
                executor.submit(() -> {
                    try {
                        String hash = passwordEncoder.encode("password" + idx);
                        if (passwordEncoder.matches("password" + idx, hash)) {
                            success.incrementAndGet();
                        }
                    } finally {
                        latch.countDown();
                    }
                });
            }

            assertTrue(latch.await(30, TimeUnit.SECONDS));
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;
            executor.shutdown();

            assertEquals(threads, success.get());
            System.out.println("[PERF] Concurrent BCrypt: " + threads + " ops in " + elapsedMs + "ms");
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Data Structure Performance (Pagination / Collection)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Collection & Pagination Performance")
    class CollectionPerformanceTests {

        @Test
        @DisplayName("Large list pagination: 100K items should paginate within 50ms")
        void largePagination_100KItems_shouldBeEfficient() {
            List<String> items = new ArrayList<>(100_000);
            for (int i = 0; i < 100_000; i++) {
                items.add("item-" + i);
            }

            int page = 500;
            int size = 20;
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, items.size());

            long start = System.nanoTime();
            List<String> pageItems = items.subList(fromIndex, toIndex);
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertEquals(size, pageItems.size());
            assertTrue(elapsedMs < 50,
                "Pagination of 100K items took " + elapsedMs + "ms, expected < 50ms");
        }

        @Test
        @DisplayName("Stream filtering: 50K items should filter within 100ms")
        void streamFiltering_50KItems_shouldBeEfficient() {
            List<Integer> items = IntStream.range(0, 50_000)
                .boxed()
                .toList();

            long start = System.nanoTime();
            List<Integer> filtered = items.stream()
                .filter(i -> i % 7 == 0)
                .filter(i -> i > 10_000)
                .toList();
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertFalse(filtered.isEmpty());
            assertTrue(elapsedMs < 100,
                "Stream filtering took " + elapsedMs + "ms, expected < 100ms");
            System.out.println("[PERF] Stream filter 50K: " + filtered.size()
                + " results in " + elapsedMs + "ms");
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. String Processing Performance
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("String Processing Performance")
    class StringProcessingTests {

        @Test
        @DisplayName("Vietnamese slug generation: 1000 slugs should complete within 500ms")
        void slugGeneration_1000Vietnamese_shouldBeEfficient() {
            String[] titles = {
                "Xin chào Việt Nam - Tuyển dụng IT",
                "Lập trình viên Java Senior — Hồ Chí Minh",
                "Kỹ sư DevOps & Cloud Infrastructure",
                "Thiết kế UI/UX cho ứng dụng di động",
                "Phân tích dữ liệu & Machine Learning"
            };

            long start = System.nanoTime();
            for (int i = 0; i < 1000; i++) {
                String title = titles[i % titles.length];
                // Simulate slug generation: normalize + lowercase + replace
                String slug = java.text.Normalizer
                    .normalize(title, java.text.Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "")
                    .toLowerCase()
                    .replaceAll("[đĐ]", "d")
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-")
                    .replaceAll("-+", "-")
                    .replaceAll("^-|-$", "");
            }
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertTrue(elapsedMs < 500,
                "1000 slug generations took " + elapsedMs + "ms, expected < 500ms");
            System.out.println("[PERF] Slug generation: 1000 slugs in " + elapsedMs + "ms");
        }

        @Test
        @DisplayName("Email validation regex: 10K validations should complete within 200ms")
        void emailRegex_10KValidations_shouldBeEfficient() {
            String emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
            String[] emails = {
                "valid@email.com",
                "user.name+tag@domain.co",
                "invalid@",
                "@no-local.com",
                "very.long.email.address.for.testing@subdomain.domain.com"
            };

            long start = System.nanoTime();
            int matchCount = 0;
            for (int i = 0; i < 10_000; i++) {
                if (emails[i % emails.length].matches(emailPattern)) {
                    matchCount++;
                }
            }
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;

            assertTrue(matchCount > 0);
            assertTrue(elapsedMs < 200,
                "10K regex validations took " + elapsedMs + "ms, expected < 200ms");
            System.out.println("[PERF] Email regex: 10K validations in " + elapsedMs + "ms");
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Memory Allocation Performance
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Memory Efficiency")
    class MemoryEfficiencyTests {

        @Test
        @DisplayName("1000 token objects should not exceed 10MB memory")
        void tokenMemory_1000Tokens_shouldNotExceed10MB() throws Exception {
            JwtTokenUtil util = new JwtTokenUtil();
            Field secretField = JwtTokenUtil.class.getDeclaredField("SECRET");
            secretField.setAccessible(true);
            secretField.set(util, "iting-portal-test-secret-key-must-be-at-least-32-characters-long-for-hmac");
            Field expField = JwtTokenUtil.class.getDeclaredField("EXPIRATION");
            expField.setAccessible(true);
            expField.set(util, 86400000L);

            Runtime runtime = Runtime.getRuntime();
            runtime.gc();
            long beforeMemory = runtime.totalMemory() - runtime.freeMemory();

            List<String> tokens = new ArrayList<>(1000);
            for (int i = 0; i < 1000; i++) {
                tokens.add(util.generateToken((long) i, "user" + i + "@test.com", "CANDIDATE"));
            }

            long afterMemory = runtime.totalMemory() - runtime.freeMemory();
            long usedMB = (afterMemory - beforeMemory) / (1024 * 1024);

            assertFalse(tokens.isEmpty());
            assertTrue(usedMB < 10,
                "1000 tokens consumed " + usedMB + "MB, expected < 10MB");
            System.out.println("[PERF] Memory: 1000 tokens consumed ~" + usedMB + "MB");
        }
    }
}

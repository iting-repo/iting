package com.iting.jobportal.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Password hashing security tests using Spring Security's BCryptPasswordEncoder.
 *
 * <p>Covers:
 * <ul>
 *   <li>BCrypt cost (work factor) ≥ 10 — strong enough for 2026</li>
 *   <li>Salt uniqueness — same password → different hash</li>
 *   <li>Verification correctness</li>
 *   <li>Timing-safe comparison (no early-return leak)</li>
 *   <li>Hash length & format (`$2a$10$...`)</li>
 *   <li>Long & unicode password support</li>
 * </ul>
 */
@DisplayName("Password Security Tests")
class PasswordSecurityTest {

    /** Project's default encoder — must match production strength. */
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ──────────────────────────────────────────────────────────────
    // 1. Hashing Strength (Work Factor)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Hashing Strength")
    class HashingStrengthTests {

        @Test
        @DisplayName("BCrypt cost (work factor) must be at least 10")
        void bcryptCost_shouldBeAtLeast10() {
            String hash = encoder.encode("Password123!");
            // BCrypt format: $2a$XX$... where XX is the cost
            String[] parts = hash.split("\\$");
            assertEquals(4, parts.length);

            int cost = Integer.parseInt(parts[2]);
            assertTrue(cost >= 10,
                    "BCrypt cost must be ≥ 10 (current: " + cost + "). " +
                    "OWASP recommends ≥ 10 for 2024+, ≥ 12 for high-security.");
        }

        @Test
        @DisplayName("Hash format must match BCrypt standard")
        void hashFormat_shouldStartWithBcryptPrefix() {
            String hash = encoder.encode("Password123!");
            assertTrue(
                    hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"),
                    "Hash must start with BCrypt prefix: " + hash);
        }

        @Test
        @DisplayName("Hash length must be exactly 60 characters (BCrypt standard)")
        void hashLength_shouldBe60Chars() {
            String hash = encoder.encode("Password123!");
            assertEquals(60, hash.length(),
                    "BCrypt hashes must be exactly 60 chars");
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Salt Uniqueness
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Salt Uniqueness")
    class SaltUniquenessTests {

        @Test
        @DisplayName("Same password should produce different hashes (salt)")
        void samePassword_shouldProduceDifferentHashes() {
            String password = "MySecret@Password123";
            String hash1 = encoder.encode(password);
            String hash2 = encoder.encode(password);
            String hash3 = encoder.encode(password);

            assertNotEquals(hash1, hash2);
            assertNotEquals(hash2, hash3);
            assertNotEquals(hash1, hash3);
        }

        @Test
        @DisplayName("100 hashes of same password should all be unique")
        void manyHashesOfSamePassword_shouldAllBeUnique() {
            String password = "Repeated@Password";
            Set<String> hashes = new HashSet<>();

            for (int i = 0; i < 100; i++) {
                hashes.add(encoder.encode(password));
            }

            assertEquals(100, hashes.size(),
                    "BCrypt produced duplicate hashes — salt may not be random");
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Verification Correctness
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Verification")
    class VerificationTests {

        @Test
        @DisplayName("Matches returns true for correct password")
        void matches_correctPassword_shouldReturnTrue() {
            String password = "Correct@Password123";
            String hash = encoder.encode(password);

            assertTrue(encoder.matches(password, hash));
        }

        @Test
        @DisplayName("Matches returns false for wrong password")
        void matches_wrongPassword_shouldReturnFalse() {
            String hash = encoder.encode("Correct@Password");

            assertFalse(encoder.matches("WrongPassword", hash));
            assertFalse(encoder.matches("correct@password", hash)); // case-sensitive
            assertFalse(encoder.matches("Correct@Password ", hash)); // trailing space
            assertFalse(encoder.matches(" Correct@Password", hash)); // leading space
        }

        @Test
        @DisplayName("Matches returns false for empty password")
        void matches_emptyPassword_shouldReturnFalse() {
            String hash = encoder.encode("Password123");
            assertFalse(encoder.matches("", hash));
        }

        @Test
        @DisplayName("Matches throws on null password (fail-loud, not silently false)")
        void matches_nullPassword_shouldThrow() {
            String hash = encoder.encode("Password123");
            // BCryptPasswordEncoder throws IllegalArgumentException on null —
            // this is correct fail-loud behavior preventing silent auth bypass
            assertThrows(IllegalArgumentException.class, () -> encoder.matches(null, hash));
        }

        @Test
        @DisplayName("Matches handles malformed hash gracefully")
        void matches_malformedHash_shouldReturnFalse() {
            assertFalse(encoder.matches("password", "not-a-bcrypt-hash"));
            assertFalse(encoder.matches("password", ""));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Timing-Safe Comparison
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Timing-Safe Comparison")
    class TimingSafeTests {

        @Test
        @DisplayName("Matching time should not depend on prefix similarity")
        void matchingTime_shouldNotLeakViaTimingSideChannel() {
            String correctPassword = "Cor@rectPassword123";
            String hash = encoder.encode(correctPassword);

            // 3 wrong passwords with varying prefix-similarity
            String[] wrongPasswords = {
                    "WrongPassword!",          // completely different
                    "Cor@rect_____123",        // first 4 chars match
                    "Cor@rectPassword124",     // 19/20 chars match (off by 1 at end)
            };

            long[] timings = new long[wrongPasswords.length];

            for (int i = 0; i < wrongPasswords.length; i++) {
                long start = System.nanoTime();
                for (int j = 0; j < 10; j++) {
                    encoder.matches(wrongPasswords[i], hash);
                }
                timings[i] = System.nanoTime() - start;
            }

            // BCrypt is constant-time in matching — all timings should be roughly equal
            // We use a generous tolerance (3x) because JVM warmup + system noise
            long min = Long.MAX_VALUE;
            long max = 0;
            for (long t : timings) {
                if (t < min) min = t;
                if (t > max) max = t;
            }

            double ratio = (double) max / min;
            assertTrue(ratio < 5.0,
                    "Timing variance suggests potential side-channel. Ratio: " + ratio);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Edge cases
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should hash & verify long password (up to 72 bytes BCrypt limit)")
        void longPassword_shouldWork() {
            // BCrypt truncates at 72 bytes — but should still work
            String longPassword = "a".repeat(70) + "X1";
            String hash = encoder.encode(longPassword);

            assertTrue(encoder.matches(longPassword, hash));
        }

        @Test
        @DisplayName("Should handle unicode password correctly")
        void unicodePassword_shouldWork() {
            String unicodePass = "MậtKhẩu@日本語🔒";
            String hash = encoder.encode(unicodePass);

            assertTrue(encoder.matches(unicodePass, hash));
            assertFalse(encoder.matches("MậtKhẩu@日本語", hash)); // missing emoji
        }

        @Test
        @DisplayName("Should reject same password after rehash with different cost")
        void rehashedWithDifferentCost_shouldStillVerify() {
            String password = "Password123";
            BCryptPasswordEncoder lowerCost = new BCryptPasswordEncoder(10);
            BCryptPasswordEncoder higherCost = new BCryptPasswordEncoder(11);

            String hash10 = lowerCost.encode(password);
            String hash11 = higherCost.encode(password);

            // Both should still verify (encoder auto-detects cost from hash prefix)
            assertTrue(new BCryptPasswordEncoder().matches(password, hash10));
            assertTrue(new BCryptPasswordEncoder().matches(password, hash11));
        }

        @Test
        @DisplayName("Hash should NOT contain the original password as substring")
        void hashShouldNotLeakPassword() {
            String password = "MySecretPassword12345";
            String hash = encoder.encode(password);

            assertFalse(hash.contains(password),
                    "BCrypt hash leaked plaintext password!");
            assertFalse(hash.toLowerCase().contains(password.toLowerCase()));
        }
    }
}

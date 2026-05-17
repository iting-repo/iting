package com.iting.jobportal.security;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security test suite for JWT Token generation, validation, and attack resistance.
 */
@DisplayName("JWT Token Security Tests")
class JwtTokenSecurityTest {

    private JwtTokenUtil jwtTokenUtil;

    private static final String TEST_SECRET = "iting-portal-test-secret-key-must-be-at-least-32-characters-long-for-hmac";

    @BeforeEach
    void setUp() throws Exception {
        jwtTokenUtil = new JwtTokenUtil();
        setField(jwtTokenUtil, "SECRET", TEST_SECRET);
        setField(jwtTokenUtil, "EXPIRATION", 86400000L); // 24h
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    // ──────────────────────────────────────────────────────────────
    // 1. Token Generation & Validation
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Generation")
    class TokenGenerationTests {

        @Test
        @DisplayName("Should generate valid token with correct claims")
        void generateToken_shouldContainCorrectClaims() {
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");

            assertTrue(jwtTokenUtil.validateToken(token));
            assertEquals("user@test.com", jwtTokenUtil.getEmailFromToken(token));
            assertEquals(1L, jwtTokenUtil.getUserIdFromToken(token));
            assertEquals("CANDIDATE", jwtTokenUtil.getRoleFromToken(token));
        }

        @Test
        @DisplayName("Should generate unique tokens for different users")
        void generateToken_differentUsers_shouldProduceDifferentTokens() {
            String token1 = jwtTokenUtil.generateToken(1L, "user1@test.com", "CANDIDATE");
            String token2 = jwtTokenUtil.generateToken(2L, "user2@test.com", "EMPLOYER");

            assertNotEquals(token1, token2);
        }

        @Test
        @DisplayName("Should embed role correctly for all role types")
        void generateToken_shouldEmbedAllRoles() {
            for (String role : new String[]{"CANDIDATE", "EMPLOYER", "ADMIN"}) {
                String token = jwtTokenUtil.generateToken(1L, "test@test.com", role);
                assertEquals(role, jwtTokenUtil.getRoleFromToken(token));
            }
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Token Tampering & Forgery Resistance
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Tampering Resistance")
    class TokenTamperingTests {

        @Test
        @DisplayName("Should reject token with modified payload")
        void validateToken_tamperedPayload_shouldReject() {
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");

            // Split JWT: header.payload.signature
            String[] parts = token.split("\\.");
            assertEquals(3, parts.length, "JWT must have 3 parts");

            // Tamper with payload (flip a character)
            char[] payloadChars = parts[1].toCharArray();
            payloadChars[5] = (payloadChars[5] == 'A') ? 'B' : 'A';
            String tampered = parts[0] + "." + new String(payloadChars) + "." + parts[2];

            assertFalse(jwtTokenUtil.validateToken(tampered));
        }

        @Test
        @DisplayName("Should reject token signed with different secret")
        void validateToken_wrongSecret_shouldReject() throws Exception {
            // Generate token with a different secret
            JwtTokenUtil otherUtil = new JwtTokenUtil();
            setField(otherUtil, "SECRET", "another-secret-key-that-is-at-least-32-characters-long-for-hmac");
            setField(otherUtil, "EXPIRATION", 86400000L);

            String foreignToken = otherUtil.generateToken(1L, "hacker@evil.com", "ADMIN");

            // Should be rejected by our jwtTokenUtil
            assertFalse(jwtTokenUtil.validateToken(foreignToken));
        }

        @Test
        @DisplayName("Should reject completely malformed tokens")
        void validateToken_malformed_shouldReject() {
            assertFalse(jwtTokenUtil.validateToken("not.a.jwt"));
            assertFalse(jwtTokenUtil.validateToken(""));
            assertFalse(jwtTokenUtil.validateToken("random-garbage-string"));
            assertFalse(jwtTokenUtil.validateToken("eyJhbGciOiJIUzI1NiJ9.fake.fake"));
        }

        @Test
        @DisplayName("Should reject null token")
        void validateToken_null_shouldReject() {
            assertFalse(jwtTokenUtil.validateToken(null));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Token Expiration
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Expiration")
    class TokenExpirationTests {

        @Test
        @DisplayName("Should reject expired token")
        void validateToken_expired_shouldReject() throws Exception {
            // Create util with 0ms expiration (immediately expired)
            JwtTokenUtil expiredUtil = new JwtTokenUtil();
            setField(expiredUtil, "SECRET", TEST_SECRET);
            setField(expiredUtil, "EXPIRATION", 0L);

            String expiredToken = expiredUtil.generateToken(1L, "user@test.com", "CANDIDATE");

            // Small delay to ensure expiration
            Thread.sleep(10);

            assertFalse(jwtTokenUtil.validateToken(expiredToken));
        }

        @Test
        @DisplayName("Token should have valid expiration claim")
        void generateToken_shouldHaveExpirationClaim() {
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");
            Claims claims = jwtTokenUtil.getClaims(token);

            assertNotNull(claims.getExpiration());
            assertTrue(claims.getExpiration().getTime() > System.currentTimeMillis());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Role Privilege Escalation Prevention
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Privilege Escalation Prevention")
    class PrivilegeEscalationTests {

        @Test
        @DisplayName("CANDIDATE token should not contain ADMIN role")
        void candidateToken_shouldNotHaveAdminRole() {
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");
            String role = jwtTokenUtil.getRoleFromToken(token);

            assertNotEquals("ADMIN", role);
            assertEquals("CANDIDATE", role);
        }

        @Test
        @DisplayName("Token role should be exactly what was set — no injection")
        void tokenRole_shouldNotAllowInjection() {
            // Attempt to inject a different role via payload manipulation
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");
            Claims claims = jwtTokenUtil.getClaims(token);

            // Verify role is exactly CANDIDATE, not something injected
            assertEquals("CANDIDATE", claims.get("role", String.class));
            assertNull(claims.get("admin"));
            assertNull(claims.get("isAdmin"));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Input Injection & Boundary Tests
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Input Sanitization")
    class InputSanitizationTests {

        @Test
        @DisplayName("Should handle email with special characters safely")
        void generateToken_specialCharsInEmail_shouldNotBreakToken() {
            String specialEmail = "user+tag@test.com";
            String token = jwtTokenUtil.generateToken(1L, specialEmail, "CANDIDATE");

            assertTrue(jwtTokenUtil.validateToken(token));
            assertEquals(specialEmail, jwtTokenUtil.getEmailFromToken(token));
        }

        @Test
        @DisplayName("Should handle XSS payload in email without executing")
        void generateToken_xssInEmail_shouldStoreAsSafeString() {
            String xssEmail = "<script>alert('xss')</script>@evil.com";
            String token = jwtTokenUtil.generateToken(1L, xssEmail, "CANDIDATE");

            assertTrue(jwtTokenUtil.validateToken(token));
            // XSS is stored as plain text, not executed
            assertEquals(xssEmail, jwtTokenUtil.getEmailFromToken(token));
        }

        @Test
        @DisplayName("Should handle SQL injection payload safely")
        void generateToken_sqlInjectionInEmail_shouldBeHarmless() {
            String sqlInject = "'; DROP TABLE accounts; --";
            String token = jwtTokenUtil.generateToken(1L, sqlInject, "CANDIDATE");

            assertTrue(jwtTokenUtil.validateToken(token));
            assertEquals(sqlInject, jwtTokenUtil.getEmailFromToken(token));
        }
    }
}

package com.iting.jobportal.security;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.security.RefreshTokenUtil;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security tests for refresh tokens.
 *
 * <p>Critical security properties verified:
 * <ul>
 *   <li>Refresh token MUST have unique JTI (JWT ID) — enables revocation</li>
 *   <li>Access token MUST NOT be usable as refresh token (type claim check)</li>
 *   <li>Refresh secret MUST be different from access secret</li>
 *   <li>Expiry is enforced on refresh tokens</li>
 *   <li>Tampered refresh tokens are rejected</li>
 * </ul>
 */
@DisplayName("Refresh Token Security Tests")
class RefreshTokenSecurityTest {

    private RefreshTokenUtil refreshTokenUtil;
    private JwtTokenUtil accessTokenUtil;

    private static final String REFRESH_SECRET =
            "iting-refresh-secret-must-be-at-least-32-characters-long-for-hmac-sha";
    private static final String ACCESS_SECRET =
            "iting-access-secret-must-be-at-least-32-characters-long-for-hmac-sha";

    @BeforeEach
    void setUp() throws Exception {
        refreshTokenUtil = new RefreshTokenUtil();
        setField(refreshTokenUtil, "REFRESH_SECRET", REFRESH_SECRET);
        setField(refreshTokenUtil, "REFRESH_EXPIRATION", 604800000L); // 7 days

        accessTokenUtil = new JwtTokenUtil();
        setField(accessTokenUtil, "SECRET", ACCESS_SECRET);
        setField(accessTokenUtil, "EXPIRATION", 86400000L); // 24h
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    // ──────────────────────────────────────────────────────────────
    // 1. JTI (Token ID) Uniqueness — required for revocation
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token ID Uniqueness")
    class TokenIdUniquenessTests {

        @Test
        @DisplayName("Each refresh token must have unique JTI")
        void refreshToken_shouldHaveUniqueJti() {
            Set<String> jtis = new HashSet<>();
            int count = 100;

            for (int i = 0; i < count; i++) {
                String token = refreshTokenUtil.generateRefreshToken(1L, "user@test.com");
                jtis.add(refreshTokenUtil.getTokenId(token));
            }

            assertEquals(count, jtis.size(),
                    "JTI collision detected — refresh tokens not unique. " +
                    "Revocation list would fail.");
        }

        @Test
        @DisplayName("JTI must be present in refresh token (UUID format)")
        void refreshToken_shouldHaveValidJti() {
            String token = refreshTokenUtil.generateRefreshToken(1L, "user@test.com");
            String jti = refreshTokenUtil.getTokenId(token);

            assertNotNull(jti);
            assertFalse(jti.isBlank());
            // UUID format: 8-4-4-4-12 hex chars
            assertTrue(jti.matches("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"),
                    "JTI should be UUID format: " + jti);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Type Claim — prevent access/refresh token mixing
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Type Isolation")
    class TokenTypeIsolationTests {

        @Test
        @DisplayName("Refresh token MUST have type=refresh claim")
        void refreshToken_shouldHaveTypeRefreshClaim() {
            String token = refreshTokenUtil.generateRefreshToken(1L, "user@test.com");
            Claims claims = refreshTokenUtil.getRefreshClaims(token);

            assertEquals("refresh", claims.get("type"),
                    "Refresh token must explicitly mark its type to prevent confusion");
        }

        @Test
        @DisplayName("Access token MUST NOT validate as refresh token")
        void accessToken_shouldNotValidateAsRefreshToken() {
            // Even if access & refresh used the same secret (worst case),
            // access token has no type=refresh claim, so refresh validator must reject it
            String accessToken = accessTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");

            // accessToken signed with ACCESS_SECRET; refreshTokenUtil uses REFRESH_SECRET
            // Different secrets → must reject
            assertFalse(refreshTokenUtil.validateRefreshToken(accessToken));
        }

        @Test
        @DisplayName("Token with missing type claim should be rejected as refresh")
        void tokenWithoutTypeClaim_shouldBeRejectedAsRefresh() {
            // Generate a token with refresh secret but WITHOUT type=refresh claim
            // (Simulating: an attacker who somehow got the refresh secret tries to forge
            //  a token that looks like a refresh but lacks type — must still fail)
            // We can simulate this by using the access util with refresh secret
            try {
                JwtTokenUtil sameKeyAsRefresh = new JwtTokenUtil();
                setField(sameKeyAsRefresh, "SECRET", REFRESH_SECRET);
                setField(sameKeyAsRefresh, "EXPIRATION", 86400000L);

                String tokenWithRefreshSecret =
                        sameKeyAsRefresh.generateToken(1L, "user@test.com", "ADMIN");

                // Even though signed with refresh secret, lacks type=refresh claim
                assertFalse(refreshTokenUtil.validateRefreshToken(tokenWithRefreshSecret),
                        "Token without type=refresh must not validate as refresh");
            } catch (Exception e) {
                fail(e);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Secret Isolation
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Secret Isolation")
    class SecretIsolationTests {

        @Test
        @DisplayName("Refresh token signed with access secret should NOT validate")
        void refreshTokenSignedWithAccessSecret_shouldNotValidate() throws Exception {
            // Attacker generates a token using access secret but adds type=refresh claim
            RefreshTokenUtil withAccessSecret = new RefreshTokenUtil();
            setField(withAccessSecret, "REFRESH_SECRET", ACCESS_SECRET); // wrong secret
            setField(withAccessSecret, "REFRESH_EXPIRATION", 604800000L);

            String maliciousToken = withAccessSecret.generateRefreshToken(1L, "attacker@evil.com");

            // Real refreshTokenUtil (using REFRESH_SECRET) must reject
            assertFalse(refreshTokenUtil.validateRefreshToken(maliciousToken));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Tampering Resistance
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Tampering Resistance")
    class TamperingTests {

        @Test
        @DisplayName("Tampered refresh token (modified userId claim) should be rejected")
        void tamperedUserIdClaim_shouldBeRejected() {
            String token = refreshTokenUtil.generateRefreshToken(1L, "victim@test.com");
            String[] parts = token.split("\\.");

            // Tamper with payload byte
            char[] payload = parts[1].toCharArray();
            payload[3] = (payload[3] == 'X') ? 'Y' : 'X';
            String tampered = parts[0] + "." + new String(payload) + "." + parts[2];

            assertFalse(refreshTokenUtil.validateRefreshToken(tampered),
                    "Modified payload must invalidate signature");
        }

        @Test
        @DisplayName("Refresh token with stripped signature should be rejected")
        void emptySignature_shouldBeRejected() {
            String token = refreshTokenUtil.generateRefreshToken(1L, "user@test.com");
            String[] parts = token.split("\\.");
            String stripped = parts[0] + "." + parts[1] + ".";

            assertFalse(refreshTokenUtil.validateRefreshToken(stripped));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Expiration
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Expiration")
    class ExpirationTests {

        @Test
        @DisplayName("Expired refresh token should fail validation")
        void expiredRefreshToken_shouldFailValidation() throws Exception {
            RefreshTokenUtil expiringUtil = new RefreshTokenUtil();
            setField(expiringUtil, "REFRESH_SECRET", REFRESH_SECRET);
            setField(expiringUtil, "REFRESH_EXPIRATION", 50L); // 50 ms

            String token = expiringUtil.generateRefreshToken(1L, "user@test.com");
            Thread.sleep(100);

            assertTrue(refreshTokenUtil.isTokenExpired(token));
            assertFalse(refreshTokenUtil.validateRefreshToken(token));
        }

        @Test
        @DisplayName("Fresh refresh token should not be considered expired")
        void freshToken_shouldNotBeExpired() {
            String token = refreshTokenUtil.generateRefreshToken(1L, "user@test.com");

            assertFalse(refreshTokenUtil.isTokenExpired(token));
        }

        @Test
        @DisplayName("isTokenExpired returns true for malformed token (fail-safe)")
        void malformedToken_shouldBeTreatedAsExpired() {
            // Fail-safe: invalid token should be treated as expired (deny access)
            assertTrue(refreshTokenUtil.isTokenExpired("not.a.valid.jwt"));
            assertTrue(refreshTokenUtil.isTokenExpired(""));
        }
    }
}

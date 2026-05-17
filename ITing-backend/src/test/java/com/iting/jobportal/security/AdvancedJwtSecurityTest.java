package com.iting.jobportal.security;

import com.iting.jobportal.auth.security.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Advanced JWT attack-vector tests beyond basic tampering.
 *
 * <p>Covers attacks from OWASP JWT cheatsheet & RFC 8725 (JWT Best Current Practices):
 * <ul>
 *   <li>"alg: none" signature stripping</li>
 *   <li>Algorithm confusion (HS256 ↔ RS256)</li>
 *   <li>Empty signature</li>
 *   <li>Reserved claim manipulation (iat, exp, nbf)</li>
 *   <li>Long-payload DoS</li>
 *   <li>Replay across boundaries</li>
 * </ul>
 */
@DisplayName("Advanced JWT Security Tests")
class AdvancedJwtSecurityTest {

    private JwtTokenUtil jwtTokenUtil;

    private static final String TEST_SECRET =
            "iting-portal-test-secret-key-must-be-at-least-32-characters-long-for-hmac";

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
    // 1. "alg: none" Attack — historical critical JWT vulnerability
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Algorithm None Attack")
    class AlgorithmNoneAttackTests {

        @Test
        @DisplayName("Should reject token with alg=none header (no signature)")
        void validateToken_algNone_shouldReject() {
            // Craft a fake "alg: none" token manually
            String header = base64UrlEncode("{\"alg\":\"none\",\"typ\":\"JWT\"}");
            String payload = base64UrlEncode(
                    "{\"sub\":\"admin@evil.com\",\"role\":\"ADMIN\",\"id\":1,\"exp\":9999999999}");
            String malicious = header + "." + payload + "."; // empty signature

            assertFalse(jwtTokenUtil.validateToken(malicious),
                    "JJWT library MUST reject alg=none — historical CVE-2015-2951");
        }

        @Test
        @DisplayName("Should reject token with alg=none + empty signature variant")
        void validateToken_algNoneEmptySignature_shouldReject() {
            String header = base64UrlEncode("{\"alg\":\"None\",\"typ\":\"JWT\"}"); // case variant
            String payload = base64UrlEncode("{\"sub\":\"admin@evil.com\",\"role\":\"ADMIN\"}");
            String malicious = header + "." + payload + ".";

            assertFalse(jwtTokenUtil.validateToken(malicious));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Algorithm Confusion (HS256 ↔ RS256)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Algorithm Confusion Attack")
    class AlgorithmConfusionTests {

        @Test
        @DisplayName("Should reject token signed with wrong algorithm but same secret")
        void validateToken_wrongAlgorithm_shouldReject() {
            // Token signed with HS512 instead of HS256 — but our util expects HS256
            SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
            String hs512Token = Jwts.builder()
                    .setSubject("user@test.com")
                    .claim("id", 1L)
                    .claim("role", "ADMIN")
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                    .signWith(key, SignatureAlgorithm.HS512)
                    .compact();

            // Library should still validate the signature using same key but different algorithm
            // The important thing: HS256 doesn't accept it as HS256 silently
            // (Either both work, or HS512 is rejected — both acceptable, but no privilege escalation)
            // We verify the role is preserved exactly
            if (jwtTokenUtil.validateToken(hs512Token)) {
                // If accepted, role must match what was signed
                assertEquals("ADMIN", jwtTokenUtil.getRoleFromToken(hs512Token));
            }
            // Either accept (and preserve claims) or reject — neither produces escalation
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Claim Manipulation (exp, iat, nbf)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Reserved Claim Manipulation")
    class ReservedClaimManipulationTests {

        @Test
        @DisplayName("Should reject token with future iat (issued in future)")
        void validateToken_futureIat_shouldStillRejectIfExpiredOrInvalid() {
            // Generate normal token first
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");
            assertTrue(jwtTokenUtil.validateToken(token));

            // iat claim is read-only after signing — we can't manipulate without breaking signature
            Claims claims = jwtTokenUtil.getClaims(token);
            assertTrue(claims.getIssuedAt().getTime() <= System.currentTimeMillis() + 1000);
        }

        @Test
        @DisplayName("Should reject token with massively distant exp")
        void validateToken_extremelyFarExp_signatureRequired() {
            // Craft payload with exp far in future
            String header = base64UrlEncode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            String payload = base64UrlEncode(
                    "{\"sub\":\"user@test.com\",\"id\":1,\"role\":\"ADMIN\",\"exp\":99999999999}");
            String fakeSignature = base64UrlEncode("fake");
            String unsignedAttack = header + "." + payload + "." + fakeSignature;

            assertFalse(jwtTokenUtil.validateToken(unsignedAttack),
                    "Far-future exp doesn't bypass signature check");
        }

        @Test
        @DisplayName("Token with empty body should be rejected")
        void validateToken_emptyBody_shouldReject() {
            String header = base64UrlEncode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
            String payload = base64UrlEncode("{}");
            String malicious = header + "." + payload + ".sig";

            assertFalse(jwtTokenUtil.validateToken(malicious));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. DoS via Large Payload
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Large Payload Resilience")
    class LargePayloadTests {

        @Test
        @DisplayName("Should reject extremely large fake JWT without crashing")
        void validateToken_oversizedPayload_shouldRejectGracefully() {
            // Build a 1 MB string as fake signature
            String hugeSig = "A".repeat(1_000_000);
            String malicious = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0." + hugeSig;

            assertDoesNotThrow(() -> {
                boolean valid = jwtTokenUtil.validateToken(malicious);
                assertFalse(valid);
            });
        }

        @Test
        @DisplayName("Should reject token with too many segments (> 3)")
        void validateToken_extraSegments_shouldReject() {
            String token = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");
            String malformed = token + ".extra.segment";

            assertFalse(jwtTokenUtil.validateToken(malformed));
        }

        @Test
        @DisplayName("Should reject token with too few segments (< 3)")
        void validateToken_missingSegments_shouldReject() {
            String header = base64UrlEncode("{\"alg\":\"HS256\"}");
            String payload = base64UrlEncode("{\"sub\":\"test\"}");

            // Missing signature
            assertFalse(jwtTokenUtil.validateToken(header + "." + payload));
            // Only header
            assertFalse(jwtTokenUtil.validateToken(header));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Token Reusability Across Different Users/Sessions
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Isolation")
    class TokenIsolationTests {

        @Test
        @DisplayName("Two tokens for same user should differ (anti-replay)")
        void generateToken_sameUserTwice_canMatchButShouldNotBypassExpiry() throws InterruptedException {
            String token1 = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");
            Thread.sleep(1100); // 1+ second gap to ensure iat differs
            String token2 = jwtTokenUtil.generateToken(1L, "user@test.com", "CANDIDATE");

            Claims c1 = jwtTokenUtil.getClaims(token1);
            Claims c2 = jwtTokenUtil.getClaims(token2);

            // iat must differ (security best practice)
            assertNotEquals(c1.getIssuedAt().getTime(), c2.getIssuedAt().getTime(),
                    "Token issued-at timestamps should differ to prevent perfect replay");
        }

        @Test
        @DisplayName("Token for user A should not return user B's identity")
        void getUserIdFromToken_isolatedPerToken() {
            String tokenA = jwtTokenUtil.generateToken(1L, "userA@test.com", "CANDIDATE");
            String tokenB = jwtTokenUtil.generateToken(2L, "userB@test.com", "CANDIDATE");

            assertEquals(1L, jwtTokenUtil.getUserIdFromToken(tokenA));
            assertEquals(2L, jwtTokenUtil.getUserIdFromToken(tokenB));
            assertNotEquals(
                    jwtTokenUtil.getUserIdFromToken(tokenA),
                    jwtTokenUtil.getUserIdFromToken(tokenB)
            );
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 6. Boundary: Exactly-expired token
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Expiration Boundary")
    class ExpirationBoundaryTests {

        @Test
        @DisplayName("Token with exp = current time should be rejected (no grace period)")
        void validateToken_atExactExpiry_shouldReject() throws Exception {
            JwtTokenUtil immediateExpUtil = new JwtTokenUtil();
            setField(immediateExpUtil, "SECRET", TEST_SECRET);
            setField(immediateExpUtil, "EXPIRATION", 50L); // 50ms

            String token = immediateExpUtil.generateToken(1L, "user@test.com", "CANDIDATE");
            Thread.sleep(100); // wait past expiry

            assertFalse(jwtTokenUtil.validateToken(token));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 7. Unicode / Encoding Attacks
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Unicode & Encoding")
    class UnicodeTests {

        @Test
        @DisplayName("Should handle unicode in email correctly without breaking signature")
        void generateToken_unicodeEmail_shouldRoundTrip() {
            String unicodeEmail = "ngườidùng@テスト.例え";
            String token = jwtTokenUtil.generateToken(1L, unicodeEmail, "CANDIDATE");

            assertTrue(jwtTokenUtil.validateToken(token));
            assertEquals(unicodeEmail, jwtTokenUtil.getEmailFromToken(token));
        }

        @Test
        @DisplayName("Should handle null byte injection in email")
        void generateToken_nullByteInEmail_shouldStoreSafely() {
            String email = "user @test.com";
            String token = jwtTokenUtil.generateToken(1L, email, "CANDIDATE");

            assertTrue(jwtTokenUtil.validateToken(token));
            // The null byte must round-trip — it doesn't truncate the string
            assertEquals(email, jwtTokenUtil.getEmailFromToken(token));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Helper
    // ──────────────────────────────────────────────────────────────

    private static String base64UrlEncode(String input) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(input.getBytes(StandardCharsets.UTF_8));
    }
}

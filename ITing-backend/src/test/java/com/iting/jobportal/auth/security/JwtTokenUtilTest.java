package com.iting.jobportal.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import java.lang.reflect.Field;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class JwtTokenUtilTest {

  private JwtTokenUtil util;

  @BeforeEach
  void setUp() throws Exception {
    util = new JwtTokenUtil();
    setField("SECRET", "iting-portal-secret-key-must-be-at-least-32-characters-long");
    setField("EXPIRATION", 86_400_000L);
  }

  private void setField(String name, Object value) throws Exception {
    Field f = JwtTokenUtil.class.getDeclaredField(name);
    f.setAccessible(true);
    f.set(util, value);
  }

  // ── generateToken / parse ───────────────────────────────────────────

  @Test
  void generateToken_thenValidateAndExtract() {
    String token = util.generateToken(42L, "alice@iting.vn", "CANDIDATE");

    assertNotNull(token);
    assertTrue(util.validateToken(token));
    assertEquals("alice@iting.vn", util.getEmailFromToken(token));
    assertEquals(42L, util.getUserIdFromToken(token));
    assertEquals("CANDIDATE", util.getRoleFromToken(token));
  }

  @Test
  void generateToken_differentRoles() {
    String t1 = util.generateToken(1L, "admin@iting.vn", "ADMIN");
    String t2 = util.generateToken(2L, "emp@iting.vn", "EMPLOYER");

    assertEquals("ADMIN", util.getRoleFromToken(t1));
    assertEquals("EMPLOYER", util.getRoleFromToken(t2));
  }

  // ── validateToken ───────────────────────────────────────────────────

  @Test
  void validateToken_malformed_returnsFalse() {
    assertFalse(util.validateToken("not-a-jwt"));
  }

  @Test
  void validateToken_empty_returnsFalse() {
    assertFalse(util.validateToken(""));
  }

  @Test
  void validateToken_null_returnsFalse() {
    assertFalse(util.validateToken(null));
  }

  @Test
  void validateToken_signedWithDifferentKey_returnsFalse() throws Exception {
    // Token from another JwtTokenUtil with different secret
    JwtTokenUtil other = new JwtTokenUtil();
    Field f = JwtTokenUtil.class.getDeclaredField("SECRET");
    f.setAccessible(true);
    f.set(other, "another-secret-key-with-at-least-32-characters-for-hs256");
    Field e = JwtTokenUtil.class.getDeclaredField("EXPIRATION");
    e.setAccessible(true);
    e.set(other, 86_400_000L);

    String foreignToken = other.generateToken(1L, "x@iting.vn", "ADMIN");

    // util has a different secret → cannot validate
    assertFalse(util.validateToken(foreignToken));
  }

  @Test
  void validateToken_expired_returnsFalse() throws Exception {
    setField("EXPIRATION", -10_000L); // already expired
    String token = util.generateToken(1L, "x@iting.vn", "ADMIN");

    assertFalse(util.validateToken(token));
  }

  @Test
  void getClaims_expired_throws() throws Exception {
    setField("EXPIRATION", -10_000L);
    String token = util.generateToken(1L, "x@iting.vn", "ADMIN");

    assertThrows(ExpiredJwtException.class, () -> util.getClaims(token));
  }

  @Test
  void getClaims_malformed_throws() {
    assertThrows(MalformedJwtException.class, () -> util.getClaims("bogus"));
  }

  // ── getUserIdFromHeader ─────────────────────────────────────────────

  @Test
  void getUserIdFromHeader_validBearerToken_returnsUserId() {
    String token = util.generateToken(99L, "x@iting.vn", "USER");
    MockHttpServletRequest req = new MockHttpServletRequest();
    req.addHeader("Authorization", "Bearer " + token);

    assertEquals(99L, util.getUserIdFromHeader(req));
  }

  @Test
  void getUserIdFromHeader_noHeader_returnsNull() {
    MockHttpServletRequest req = new MockHttpServletRequest();
    assertNull(util.getUserIdFromHeader(req));
  }

  @Test
  void getUserIdFromHeader_headerWithoutBearer_returnsNull() {
    MockHttpServletRequest req = new MockHttpServletRequest();
    req.addHeader("Authorization", "Basic abc123");

    assertNull(util.getUserIdFromHeader(req));
  }

  @Test
  void getUserIdFromHeader_emptyBearer_throws() {
    MockHttpServletRequest req = new MockHttpServletRequest();
    req.addHeader("Authorization", "Bearer ");

    // empty token after "Bearer " → parse fails
    assertThrows(Exception.class, () -> util.getUserIdFromHeader(req));
  }

  // ── Hết hạn phiên theo SystemConfig.sessionTimeout ──────────────────

  @Test
  void getExpirationSeconds_noConfig_usesDefaultExpiration() {
    // không set adminConfigService → fallback EXPIRATION (86_400_000 ms)
    assertEquals(86_400L, util.getExpirationSeconds());
  }

  @Test
  void getExpirationSeconds_withConfig_usesSessionTimeoutMinutes() throws Exception {
    com.iting.jobportal.admin.service.AdminConfigService cfgService =
        org.mockito.Mockito.mock(com.iting.jobportal.admin.service.AdminConfigService.class);
    org.mockito.Mockito.when(cfgService.getConfig())
        .thenReturn(
            com.iting.jobportal.admin.entity.SystemConfig.builder().sessionTimeout(15).build());
    setField("adminConfigService", cfgService);

    assertEquals(15L * 60, util.getExpirationSeconds(), "15 phút → 900 giây");

    // token cũng phải hết hạn ~15 phút (còn hiệu lực ngay sau khi tạo)
    String token = util.generateToken(1L, "x@iting.vn", "ADMIN");
    assertTrue(util.validateToken(token));
  }

  // ── Smoke ───────────────────────────────────────────────────────────

  @Test
  void roundTrip_allFieldsPreserved() {
    String token = util.generateToken(123L, "user-test@example.com", "EMPLOYER");

    assertEquals(123L, util.getUserIdFromToken(token));
    assertEquals("user-test@example.com", util.getEmailFromToken(token));
    assertEquals("EMPLOYER", util.getRoleFromToken(token));
  }
}

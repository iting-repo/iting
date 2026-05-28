package com.iting.jobportal.auth.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import java.lang.reflect.Field;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RefreshTokenUtilTest {

  private RefreshTokenUtil util;

  @BeforeEach
  void setUp() throws Exception {
    util = new RefreshTokenUtil();
    setField(
        util,
        "REFRESH_SECRET",
        "iting-portal-refresh-secret-key-must-be-at-least-32-characters-long");
    setField(util, "REFRESH_EXPIRATION", 604_800_000L);
  }

  private void setField(RefreshTokenUtil target, String name, Object value) throws Exception {
    Field f = RefreshTokenUtil.class.getDeclaredField(name);
    f.setAccessible(true);
    f.set(target, value);
  }

  // ── generate / validate ─────────────────────────────────────────────

  @Test
  void generateRefreshToken_roundTrip() {
    String token = util.generateRefreshToken(42L, "alice@iting.vn");

    assertNotNull(token);
    assertTrue(util.validateRefreshToken(token));
    assertEquals("alice@iting.vn", util.getEmailFromRefreshToken(token));
    assertEquals(42L, util.getUserIdFromRefreshToken(token));
  }

  @Test
  void generateRefreshToken_includesTypeClaim() {
    String token = util.generateRefreshToken(1L, "x@iting.vn");

    Claims claims = util.getRefreshClaims(token);
    assertEquals("refresh", claims.get("type"));
  }

  @Test
  void generateRefreshToken_uniqueTokenId() {
    String t1 = util.generateRefreshToken(1L, "a@iting.vn");
    String t2 = util.generateRefreshToken(1L, "a@iting.vn");

    String id1 = util.getTokenId(t1);
    String id2 = util.getTokenId(t2);
    assertNotNull(id1);
    assertNotNull(id2);
    org.junit.jupiter.api.Assertions.assertNotEquals(id1, id2);
  }

  // ── validateRefreshToken ────────────────────────────────────────────

  @Test
  void validateRefreshToken_malformed_returnsFalse() {
    assertFalse(util.validateRefreshToken("not.a.jwt"));
  }

  @Test
  void validateRefreshToken_empty_returnsFalse() {
    assertFalse(util.validateRefreshToken(""));
  }

  @Test
  void validateRefreshToken_null_returnsFalse() {
    assertFalse(util.validateRefreshToken(null));
  }

  @Test
  void validateRefreshToken_wrongSecret_returnsFalse() throws Exception {
    RefreshTokenUtil other = new RefreshTokenUtil();
    setField(
        other, "REFRESH_SECRET", "another-refresh-secret-with-at-least-32-characters-for-hmac");
    setField(other, "REFRESH_EXPIRATION", 604_800_000L);

    String foreign = other.generateRefreshToken(1L, "x@iting.vn");

    assertFalse(util.validateRefreshToken(foreign));
  }

  @Test
  void validateRefreshToken_expired_returnsFalse() throws Exception {
    setField(util, "REFRESH_EXPIRATION", -1000L);
    String token = util.generateRefreshToken(1L, "x@iting.vn");

    assertFalse(util.validateRefreshToken(token));
  }

  // ── isTokenExpired ──────────────────────────────────────────────────

  @Test
  void isTokenExpired_freshToken_false() {
    String token = util.generateRefreshToken(1L, "x@iting.vn");
    assertFalse(util.isTokenExpired(token));
  }

  @Test
  void isTokenExpired_expiredToken_true() throws Exception {
    setField(util, "REFRESH_EXPIRATION", -1000L);
    String token = util.generateRefreshToken(1L, "x@iting.vn");

    // expired → catch ExpiredJwtException → returns true
    assertTrue(util.isTokenExpired(token));
  }

  @Test
  void isTokenExpired_malformed_returnsTrue() {
    // exception path → true
    assertTrue(util.isTokenExpired("bogus"));
  }

  // ── getRefreshClaims ────────────────────────────────────────────────

  @Test
  void getRefreshClaims_expired_throws() throws Exception {
    setField(util, "REFRESH_EXPIRATION", -1000L);
    String token = util.generateRefreshToken(1L, "x@iting.vn");

    assertThrows(ExpiredJwtException.class, () -> util.getRefreshClaims(token));
  }
}

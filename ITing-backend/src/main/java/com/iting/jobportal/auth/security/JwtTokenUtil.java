package com.iting.jobportal.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenUtil {

  @Value("${jwt.secret:iting-portal-secret-key-must-be-at-least-32-characters-long}")
  private String SECRET;

  @Value("${jwt.expiration:86400000}")
  private long EXPIRATION;

  // Optional: nếu admin cấu hình "Hết hạn phiên (phút)" → token hết hạn theo đó.
  // Test khởi tạo bằng new → null → dùng EXPIRATION mặc định.
  @Autowired(required = false)
  private com.iting.jobportal.admin.service.AdminConfigService adminConfigService;

  private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
  }

  /** Thời hạn token (ms): ưu tiên sessionTimeout (phút) từ SystemConfig, fallback EXPIRATION. */
  private long effectiveExpirationMs() {
    if (adminConfigService != null) {
      try {
        var cfg = adminConfigService.getConfig();
        if (cfg != null && cfg.getSessionTimeout() != null && cfg.getSessionTimeout() > 0) {
          return cfg.getSessionTimeout() * 60_000L;
        }
      } catch (RuntimeException ignored) {
        // lỗi đọc config → fallback an toàn
      }
    }
    return EXPIRATION;
  }

  /** Thời hạn token tính bằng giây (để trả về client trong expiresIn). */
  public long getExpirationSeconds() {
    return effectiveExpirationMs() / 1000L;
  }

  public String generateToken(Long userId, String email, String role) {
    return Jwts.builder()
        .setSubject(email) // Use email as subject for RBAC
        .claim("id", userId)
        .claim("role", role) // Keep role for backward compatibility
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + effectiveExpirationMs()))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public Claims getClaims(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  public boolean validateToken(String token) {
    try {
      getClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  public String getEmailFromToken(String token) {
    return getClaims(token).getSubject();
  }

  public Long getUserIdFromToken(String token) {
    return ((Number) getClaims(token).get("id")).longValue();
  }

  public String getRoleFromToken(String token) {
    return (String) getClaims(token).get("role");
  }

  public Long getUserIdFromHeader(jakarta.servlet.http.HttpServletRequest request) {
    String authHeader = request.getHeader("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);
      return getUserIdFromToken(token);
    }
    return null;
  }
}

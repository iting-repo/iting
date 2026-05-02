package com.iting.jobportal.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class RefreshTokenUtil {

    @Value("${jwt.refresh.secret:iting-portal-refresh-secret-key-must-be-at-least-32-characters-long}")
    private String REFRESH_SECRET;

    @Value("${jwt.refresh.expiration:604800000}") // 7 days
    private long REFRESH_EXPIRATION;

    private SecretKey getRefreshSigningKey() {
        return Keys.hmacShaKeyFor(REFRESH_SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateRefreshToken(Long userId, String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("id", userId)
                .claim("type", "refresh")
                .setId(UUID.randomUUID().toString()) // Unique token ID
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(getRefreshSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims getRefreshClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getRefreshSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = getRefreshClaims(token);
            return "refresh".equals(claims.get("type"));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getEmailFromRefreshToken(String token) {
        return getRefreshClaims(token).getSubject();
    }

    public Long getUserIdFromRefreshToken(String token) {
        return ((Number) getRefreshClaims(token).get("id")).longValue();
    }

    public String getTokenId(String token) {
        return getRefreshClaims(token).getId();
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = getRefreshClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return true;
        }
    }
}

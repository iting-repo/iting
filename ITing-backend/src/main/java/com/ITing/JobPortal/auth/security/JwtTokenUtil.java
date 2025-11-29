package com.iting.jobportal.auth.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenUtil {

    private final String SECRET = "supersecretkey"; // TODO: đưa vào application.properties
    private final long EXPIRATION = 86400000; // 1 day

    public String generateToken(Long userId, String email, String role) {
        return Jwts.builder()
                .claim("id", userId)
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }
}

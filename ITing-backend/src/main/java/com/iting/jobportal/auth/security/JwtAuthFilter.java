package com.iting.jobportal.auth.security;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        // Bỏ qua các đường dẫn không cần Token (chủ yếu là Swagger)
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        if (!jwtTokenUtil.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtTokenUtil.getClaims(token);
            Long userId = ((Number) claims.get("id")).longValue();
            String email = claims.getSubject();
            String roleStr = (String) claims.get("role");

            // Build Account stub từ JWT claims — không cần query DB
            Account stub = new Account();
            stub.setId(userId);
            stub.setEmail(email);
            stub.setRole(parseRole(roleStr));

            AuthUser authUser = new AuthUser(stub);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(authUser, null,
                    authUser.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            // Token hợp lệ nhưng claim bị lỗi → tiếp tục không authenticated
        }

        filterChain.doFilter(request, response);
    }

    private Role parseRole(String roleStr) {
        if (roleStr == null)
            return Role.CANDIDATE;
        try {
            // Parse rồi normalize: USER→CANDIDATE, COMPANY→EMPLOYER
            return Role.valueOf(roleStr.toUpperCase()).normalize();
        } catch (IllegalArgumentException e) {
            return Role.CANDIDATE;
        }
    }
}

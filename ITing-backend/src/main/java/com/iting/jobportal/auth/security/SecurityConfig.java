package com.iting.jobportal.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // ===================== CORS =====================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // ===================== SECURITY FILTER CHAIN =====================

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ── Public: Auth (register, login, refresh) ───────────────
                .requestMatchers("/api/auth/**").permitAll()

                // ── Public: Swagger / API Docs ────────────────────────────
                .requestMatchers(
                    "/swagger-ui/**", "/swagger-ui.html",
                    "/v3/api-docs/**", "/api-docs/**"
                ).permitAll()

                // ── Public: error endpoint (avoid secondary 403 loop) ──────
                .requestMatchers("/error").permitAll()

                // ── EMPLOYER: Quản lý Job (phải khai báo TRƯỚC các rule /{id}) ──
                .requestMatchers(HttpMethod.GET,  "/api/jobs/my-jobs").hasRole("EMPLOYER")
                .requestMatchers(HttpMethod.POST, "/api/jobs").hasRole("EMPLOYER")
                .requestMatchers(HttpMethod.PUT,  "/api/jobs/**").hasRole("EMPLOYER")
                .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasRole("EMPLOYER")
                .requestMatchers(HttpMethod.POST, "/api/jobs/*/extend").hasRole("EMPLOYER")
                .requestMatchers(HttpMethod.POST, "/api/jobs/*/close").hasRole("EMPLOYER")

                // ── Public: Job (đọc công khai — sau các rule EMPLOYER) ────
                .requestMatchers(HttpMethod.GET, "/api/jobs/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/latest").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/hot").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/{id}").permitAll()

                // ── Public: Company (xem thông tin công ty) ───────────────
                .requestMatchers(HttpMethod.GET, "/api/companies/{id}").permitAll()

                // ── EMPLOYER: Quản lý Company profile ────────────────────
                .requestMatchers(HttpMethod.PUT, "/api/companies/**").hasRole("EMPLOYER")
                .requestMatchers(HttpMethod.POST, "/api/companies/**").hasRole("EMPLOYER")

                // ── CANDIDATE + EMPLOYER + ADMIN: Nộp / xem đơn ─────────
                .requestMatchers("/api/applications/**").hasAnyRole("CANDIDATE", "EMPLOYER", "ADMIN")

                // ── ADMIN: Toàn quyền quản trị ────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // ── Các request còn lại: phải đăng nhập ──────────────────
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ===================== BEANS =====================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

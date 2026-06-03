package com.iting.jobportal.auth.security;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthFilter jwtAuthFilter;

  @Value("${app.cors.allowed-origins:http://localhost:3000}")
  private String allowedOrigins;

  // ===================== CORS =====================

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    List<String> origins = List.of(allowedOrigins.split("\\s*,\\s*"));
    configuration.setAllowedOriginPatterns(origins);
    configuration.setAllowCredentials(true);
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  // ===================== SECURITY FILTER CHAIN =====================

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth

                    // ── Public: Auth (register, login, etc) ──────────────────
                    .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/google",
                        "/api/auth/facebook",
                        "/api/auth/refresh")
                    .permitAll()
                    .requestMatchers(
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password",
                        "/api/auth/verify-otp",
                        "/api/auth/resend-otp")
                    .permitAll()

                    // ── Public: Swagger / API Docs ────────────────────────────
                    .requestMatchers(
                        "/swagger-ui/**", "/swagger-ui.html",
                        "/v3/api-docs/**", "/api-docs/**")
                    .permitAll()

                    // ── Public: Actuator health for container healthcheck ─────
                    .requestMatchers("/actuator/health", "/actuator/health/**")
                    .permitAll()

                    // ── Public: Public API endpoints ─────────────────────────
                    .requestMatchers("/api/public/**")
                    .permitAll()

                    // ── Public: Local file serving (dev fallback khi không có S3)
                    .requestMatchers("/api/files/**")
                    .permitAll()

                    // ── Public: error endpoint (avoid secondary 403 loop) ──────
                    .requestMatchers("/error")
                    .permitAll()

                    // ── Public: WebSocket handshake endpoint ───────────────────
                    .requestMatchers("/ws/**")
                    .permitAll()

                    // ── Public: Payment tiers (pricing pages) ──────────────────
                    .requestMatchers(HttpMethod.GET, "/api/payments/subscription-tiers")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/payments/boost-tiers")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/payments/sepay-webhook")
                    .permitAll()

                    // ── EMPLOYER: Quản lý Job (phải khai báo TRƯỚC các rule /{id}) ──
                    .requestMatchers(HttpMethod.GET, "/api/jobs/my-jobs")
                    .hasRole("EMPLOYER")
                    .requestMatchers(HttpMethod.POST, "/api/jobs")
                    .hasRole("EMPLOYER")
                    .requestMatchers(HttpMethod.PUT, "/api/jobs/**")
                    .hasRole("EMPLOYER")
                    .requestMatchers(HttpMethod.DELETE, "/api/jobs/**")
                    .hasRole("EMPLOYER")
                    .requestMatchers(HttpMethod.POST, "/api/jobs/*/extend")
                    .hasRole("EMPLOYER")
                    .requestMatchers(HttpMethod.POST, "/api/jobs/*/close")
                    .hasRole("EMPLOYER")

                    // ── Public: Job (đọc công khai — sau các rule EMPLOYER) ────
                    .requestMatchers(HttpMethod.GET, "/api/jobs/search")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/jobs/latest")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/jobs/hot")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/jobs/{id}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/jobs/salary-report")
                    .permitAll()
                    // AI search by CV (text + file upload) — guest cũng dùng được
                    .requestMatchers(HttpMethod.POST, "/api/jobs/analyze-cv")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/jobs/analyze-cv-file")
                    .permitAll()

                    // ── Public: AI / Knowledge Graph / Recommendations ──────────
                    .requestMatchers(HttpMethod.GET, "/api/ai/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/recommendations/**")
                    .permitAll()

                    // ── Public: Company (xem thông tin công ty) ───────────────
                    .requestMatchers(HttpMethod.GET, "/api/companies/{id}")
                    .permitAll()

                    // ── CANDIDATE: Follow Company ────────────────────────────
                    .requestMatchers("/api/companies/follow/**")
                    .hasRole("CANDIDATE")

                    // ── EMPLOYER: Quản lý Company profile ────────────────────
                    .requestMatchers(HttpMethod.PUT, "/api/companies/**")
                    .hasRole("EMPLOYER")
                    .requestMatchers(HttpMethod.POST, "/api/companies/**")
                    .hasRole("EMPLOYER")

                    // ── EMPLOYER: HR affiliation (Phase 3 — tách Company khỏi Account) ─
                    .requestMatchers("/api/hr/**")
                    .hasRole("EMPLOYER")

                    // ── CANDIDATE + EMPLOYER + ADMIN: Nộp / xem đơn ─────────
                    .requestMatchers("/api/applications/**")
                    .hasAnyRole("CANDIDATE", "EMPLOYER", "ADMIN")

                    // ── ADMIN: Toàn quyền quản trị ────────────────────────────
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                    // ── Các request còn lại: phải đăng nhập ──────────────────
                    .anyRequest()
                    .authenticated())

        // ── Trả 401 thay vì 403 khi chưa đăng nhập ──────────────
        .exceptionHandling(
            ex ->
                ex.authenticationEntryPoint(
                    (request, response, authException) -> {
                      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                      response.setContentType("application/json;charset=UTF-8");
                      response
                          .getWriter()
                          .write(
                              "{\"error\":\"Unauthorized\",\"message\":\"Token hết hạn hoặc chưa"
                                  + " đăng nhập\"}");
                    }))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  // ===================== BEANS =====================

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
      throws Exception {
    return config.getAuthenticationManager();
  }
}

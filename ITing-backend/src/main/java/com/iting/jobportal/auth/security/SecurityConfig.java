
package com.iting.jobportal.auth.security;

import com.iting.jobportal.auth.security.JwtAuthFilter;
import com.iting.jobportal.security.user.AuthUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthUserDetailsService authUserDetailsService;


    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("*")); // Cho phép tất cả (chỉ dùng khi dev)
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With"));

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        // Public endpoints
//                        .requestMatchers(
//                                "/api/auth/**",
//                                "/swagger-ui/**", "/swagger-ui.html",
//                                "/api-docs/**", "/v3/api-docs/**",
//                                "/api/jobs",           // Public job viewing
//                                "/api/jobs/search",    // Public job search
//                                "/api/jobs/featured",  // Public featured jobs
//                                "/api/jobs/{id}",      // Public job details
//                                "/api/jobs/location/**", // Public jobs by location
//                                "/api/jobs/type/**",   // Public jobs by type
//                                "/api/auth/login",
//                                "/api/auth/register",
//                                "/api/auth/**",
//                                "/api/jobs/company/**"  // Public jobs by company
//                        ).permitAll()
//
//                        // Permission-based endpoints - Jobs
//                        .requestMatchers(HttpMethod.POST, "/api/jobs").hasAuthority("JOB_CREATE")
//                        .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasAuthority("JOB_UPDATE")
//                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasAuthority("JOB_DELETE")
//                        .requestMatchers(HttpMethod.PATCH, "/api/jobs/**/toggle-status").hasAuthority("JOB_UPDATE")
//                        .requestMatchers(HttpMethod.PATCH, "/api/jobs/**/featured").hasAuthority("JOB_MANAGE")
//
//                        // User management
//                        .requestMatchers(HttpMethod.GET, "/api/users/profile").hasAuthority("USER_VIEW")
//                        .requestMatchers(HttpMethod.PUT, "/api/users/profile").hasAuthority("USER_UPDATE")
//                        .requestMatchers(HttpMethod.GET, "/api/users/{id}").hasAuthority("USER_VIEW")
//
//                        // Application management
//                        .requestMatchers(HttpMethod.POST, "/api/applications").hasAuthority("APPLICATION_CREATE")
//                        .requestMatchers(HttpMethod.GET, "/api/applications").hasAuthority("APPLICATION_VIEW")
//                        .requestMatchers(HttpMethod.PUT, "/api/applications/{id}").hasAuthority("APPLICATION_UPDATE")
//                        .requestMatchers(HttpMethod.DELETE, "/api/applications/{id}").hasAuthority("APPLICATION_DELETE")
//
//                        // Company management
//                        .requestMatchers(HttpMethod.POST, "/api/companies").hasAuthority("COMPANY_CREATE")
//                        .requestMatchers(HttpMethod.PUT, "/api/companies/**").hasAuthority("COMPANY_UPDATE")
//                        .requestMatchers(HttpMethod.DELETE, "/api/companies/**").hasAuthority("COMPANY_DELETE")
//                        .requestMatchers(HttpMethod.GET, "/api/companies/**").hasAuthority("COMPANY_VIEW")
//
//                        // Admin endpoints - require specific permissions
//                        .requestMatchers("/api/admin/**").hasAnyAuthority(
//                                "USER_MANAGE", "ROLE_MANAGE", "PERMISSION_MANAGE", "SYSTEM_ADMIN"
//                        )
//
//                        // User profile management
//                        .requestMatchers(HttpMethod.GET, "/api/userprofile/**").hasAuthority("USER_VIEW")
//                        .requestMatchers(HttpMethod.PUT, "/api/userprofile/**").hasAuthority("USER_UPDATE")
//                        .requestMatchers(HttpMethod.POST, "/api/userprofile/**").hasAuthority("USER_UPDATE")
//                        .requestMatchers(HttpMethod.DELETE, "/api/userprofile/**").hasAuthority("USER_UPDATE")
//
//                        // File management
//                        .requestMatchers(HttpMethod.POST, "/api/file/upload").hasAuthority("FILE_UPLOAD")
//                        .requestMatchers(HttpMethod.DELETE, "/api/file/**").hasAuthority("FILE_DELETE")
//
//                        // Messaging
//                        .requestMatchers(HttpMethod.POST, "/api/messaging/**").hasAuthority("MESSAGE_SEND")
//                        .requestMatchers(HttpMethod.GET, "/api/messaging/**").hasAuthority("MESSAGE_VIEW")
//
//                        // Social features
//                        .requestMatchers(HttpMethod.POST, "/api/social/**").hasAuthority("USER_UPDATE")
//                        .requestMatchers(HttpMethod.GET, "/api/social/**").hasAuthority("USER_VIEW")
//
//                        // All other requests need authentication
////                        .anyRequest().authenticated()
//                        .anyRequest().permitAll()
//                )
//                .authenticationProvider(authenticationProvider());
////                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }


@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // 1. Tắt CSRF (Bắt buộc để gọi POST/PUT/DELETE từ bên ngoài)
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Tắt CORS (Để Swagger hoặc Frontend gọi không bị chặn)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Chế độ Stateless (Vì là API thuần)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. MỞ CỬA TẤT CẢ ENDPOINTS
            .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()
            );

    // 5. LOẠI BỎ JwtAuthFilter
    // Xóa hoặc comment dòng .addFilterBefore(jwtAuthFilter...)
    // để không kiểm tra Token nữa.

    return http.build();
}

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(authUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

package com.iting.jobportal.security;

import com.iting.jobportal.auth.security.JwtAuthFilter;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.auth.security.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * API Endpoint Security Test — validates HTTP security rules from SecurityConfig.
 * Tests authentication requirements, role-based access, and attack surface.
 */
@WebMvcTest
@Import(SecurityConfig.class)
@DisplayName("API Endpoint Security Tests")
class ApiEndpointSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    // ──────────────────────────────────────────────────────────────
    // 1. Unauthenticated Access Control
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Unauthenticated Access")
    class UnauthenticatedAccessTests {

        @Test
        @DisplayName("Admin endpoints should return 401 without token")
        void adminEndpoint_withoutToken_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("User profile should return 401 without token")
        void userProfile_withoutToken_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Application endpoints should return 401 without token")
        void applications_withoutToken_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/applications"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Job creation should return 401 without token")
        void createJob_withoutToken_shouldReturn401() throws Exception {
            mockMvc.perform(post("/api/jobs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"title\":\"Test Job\"}"))
                .andExpect(status().isUnauthorized());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Public Endpoint Accessibility
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Public Endpoint Access")
    class PublicEndpointTests {

        @Test
        @DisplayName("Login endpoint should be accessible without token")
        void login_shouldBePublic() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"test@test.com\",\"password\":\"pass\"}"))
                .andExpect(status().isNot(result ->
                    assertEquals(401, result.getResponse().getStatus())));
        }

        @Test
        @DisplayName("Register endpoint should be accessible without token")
        void register_shouldBePublic() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"test@test.com\"}"))
                .andExpect(status().isNot(result ->
                    assertEquals(401, result.getResponse().getStatus())));
        }

        @Test
        @DisplayName("Health endpoint should be accessible without token")
        void healthEndpoint_shouldBePublic() throws Exception {
            mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isNot(result ->
                    assertEquals(401, result.getResponse().getStatus())));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Security Headers & Attack Surface
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Security Headers")
    class SecurityHeaderTests {

        @Test
        @DisplayName("API should return JSON content type for error responses")
        void errorResponse_shouldReturnJson() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }

        @Test
        @DisplayName("Invalid Bearer token should return 401")
        void invalidBearerToken_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard")
                    .header("Authorization", "Bearer invalid-token-here"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Malformed Authorization header should return 401")
        void malformedAuthHeader_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard")
                    .header("Authorization", "NotBearer some-token"))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Empty Authorization header should return 401")
        void emptyAuthHeader_shouldReturn401() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard")
                    .header("Authorization", ""))
                .andExpect(status().isUnauthorized());
        }
    }

    private void assertEquals(int expected, int actual) {
        org.junit.jupiter.api.Assertions.assertEquals(expected, actual);
    }
}

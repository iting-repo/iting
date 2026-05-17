package com.iting.jobportal.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack endpoint authorization tests.
 *
 * <p>Verifies that {@code SecurityConfig} rules are enforced correctly:
 * <ul>
 *   <li>Unauthenticated → 401 on protected endpoints</li>
 *   <li>Wrong role → 403 (forbidden)</li>
 *   <li>Correct role → 200 / 404 / etc (passes auth gate)</li>
 *   <li>Public endpoints accessible without auth</li>
 *   <li>Admin endpoints reject non-ADMIN</li>
 *   <li>HR endpoints reject non-EMPLOYER</li>
 * </ul>
 *
 * <p>Uses {@link WithMockUser} to inject pre-authenticated users without going through JWT filter.
 * The filter is still in the chain, but @WithMockUser pre-populates SecurityContextHolder
 * with the given role.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@DisplayName("Endpoint Authorization IT")
class EndpointAuthorizationIT {

    @Autowired private MockMvc mockMvc;

    // ──────────────────────────────────────────────────────────────
    // 1. Public endpoints — no auth required
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Public Endpoints")
    class PublicEndpointTests {

        @Test
        @DisplayName("GET /api/jobs/search is publicly accessible")
        void publicJobSearch_anonymousAllowed() throws Exception {
            mockMvc.perform(get("/api/jobs/search"))
                    .andExpect(status().is(allOf(200, 204))); // 200 OK or 204 No Content
        }

        @Test
        @DisplayName("GET /api/jobs/latest is publicly accessible")
        void publicJobLatest_anonymousAllowed() throws Exception {
            mockMvc.perform(get("/api/jobs/latest"))
                    .andExpect(status().is(allOf(200, 204)));
        }

        @Test
        @DisplayName("GET /api/public/** is publicly accessible")
        void publicEndpoints_anonymousAllowed() throws Exception {
            // Any /api/public/* should not require auth (might 404 if no controller, but NOT 401)
            mockMvc.perform(get("/api/public/anything"))
                    .andExpect(status().is(not(401)));
        }

        @Test
        @DisplayName("GET /actuator/health publicly accessible (passes auth — actual 503 is healthcheck fail)")
        void actuatorHealth_anonymousAllowed() throws Exception {
            // Health endpoint may return 503 (mail/redis down in test) but must NOT be 401
            mockMvc.perform(get("/actuator/health"))
                    .andExpect(status().is(not(401)));
        }

        @Test
        @DisplayName("POST /api/auth/login is publicly accessible (returns 4xx on bad input, not 401)")
        void authLogin_anonymousAllowedToAttempt() throws Exception {
            mockMvc.perform(post("/api/auth/login"))
                    .andExpect(status().is(not(401)));  // 400 bad request acceptable
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Admin endpoints — only ADMIN role
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Admin Endpoints Require ADMIN Role")
    class AdminEndpointTests {

        @Test
        @DisplayName("Anonymous access to /api/admin/** returns 401")
        void anonymous_adminEndpoint_returns401() throws Exception {
            mockMvc.perform(get("/api/admin/users"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("CANDIDATE role accessing /api/admin/** returns 403")
        void candidate_adminEndpoint_returns403() throws Exception {
            mockMvc.perform(get("/api/admin/users"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "EMPLOYER")
        @DisplayName("EMPLOYER role accessing /api/admin/** returns 403")
        void employer_adminEndpoint_returns403() throws Exception {
            mockMvc.perform(get("/api/admin/users"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ADMIN role passes auth gate on /api/admin/**")
        void admin_adminEndpoint_passesAuthGate() throws Exception {
            mockMvc.perform(get("/api/admin/users"))
                    .andExpect(status().is(not(401)))
                    .andExpect(status().is(not(403)));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. HR / Employer endpoints — only EMPLOYER role
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("HR Endpoints Require EMPLOYER Role")
    class HrEndpointTests {

        @Test
        @DisplayName("Anonymous access to /api/hr/** returns 401")
        void anonymous_hrEndpoint_returns401() throws Exception {
            mockMvc.perform(get("/api/hr/affiliations/me"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("CANDIDATE accessing /api/hr/** returns 403")
        void candidate_hrEndpoint_returns403() throws Exception {
            mockMvc.perform(get("/api/hr/affiliations/me"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ADMIN accessing /api/hr/** returns 403 (HR is exclusive to EMPLOYER)")
        void admin_hrEndpoint_returns403() throws Exception {
            mockMvc.perform(get("/api/hr/affiliations/me"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "EMPLOYER")
        @DisplayName("EMPLOYER accessing /api/hr/** passes auth gate")
        void employer_hrEndpoint_passesAuthGate() throws Exception {
            mockMvc.perform(get("/api/hr/affiliations/me"))
                    .andExpect(status().is(not(401)))
                    .andExpect(status().is(not(403)));
        }

        @Test
        @DisplayName("Anonymous POST /api/jobs (create job) returns 401")
        void anonymous_postJob_returns401() throws Exception {
            mockMvc.perform(post("/api/jobs"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("CANDIDATE POST /api/jobs returns 403")
        void candidate_postJob_returns403() throws Exception {
            mockMvc.perform(post("/api/jobs"))
                    .andExpect(status().isForbidden());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Candidate-specific endpoints — follow company
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Candidate Endpoints Require CANDIDATE Role")
    class CandidateEndpointTests {

        @Test
        @DisplayName("Anonymous access to /api/companies/follow/** returns 401")
        void anonymous_followCompany_returns401() throws Exception {
            mockMvc.perform(post("/api/companies/follow/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "EMPLOYER")
        @DisplayName("EMPLOYER accessing /api/companies/follow/** returns 403")
        void employer_followCompany_returns403() throws Exception {
            mockMvc.perform(post("/api/companies/follow/1"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("CANDIDATE accessing follow endpoint passes auth gate")
        void candidate_followCompany_passesAuthGate() throws Exception {
            mockMvc.perform(post("/api/companies/follow/1"))
                    .andExpect(status().is(not(401)))
                    .andExpect(status().is(not(403)));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Applications — multi-role access
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Applications Endpoints (multi-role)")
    class ApplicationsTests {

        @Test
        @DisplayName("Anonymous /api/applications/** returns 401")
        void anonymous_applications_returns401() throws Exception {
            mockMvc.perform(get("/api/applications/my"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("CANDIDATE can access /api/applications/**")
        void candidate_applications_passesAuthGate() throws Exception {
            mockMvc.perform(get("/api/applications/my"))
                    .andExpect(status().is(not(401)))
                    .andExpect(status().is(not(403)));
        }

        @Test
        @WithMockUser(roles = "EMPLOYER")
        @DisplayName("EMPLOYER can access /api/applications/**")
        void employer_applications_passesAuthGate() throws Exception {
            mockMvc.perform(get("/api/applications/my"))
                    .andExpect(status().is(not(401)))
                    .andExpect(status().is(not(403)));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 6. CORS preflight
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("CORS Preflight")
    class CorsTests {

        @Test
        @DisplayName("OPTIONS preflight from localhost:3000 should be allowed")
        void corsPreflightFromAllowedOrigin_shouldPass() throws Exception {
            mockMvc.perform(options("/api/admin/users")
                            .header("Origin", "http://localhost:3000")
                            .header("Access-Control-Request-Method", "GET")
                            .header("Access-Control-Request-Headers", "Authorization"))
                    .andExpect(status().is(not(403)));
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 7. Method-level boundary
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("HTTP Method Boundary")
    class MethodBoundaryTests {

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("GET /api/jobs/{id} is public — passes even for CANDIDATE")
        void getJob_publicPath_passesForCandidate() throws Exception {
            mockMvc.perform(get("/api/jobs/1"))
                    .andExpect(status().is(not(401)))
                    .andExpect(status().is(not(403)));
        }

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("DELETE /api/jobs/{id} requires EMPLOYER — CANDIDATE rejected")
        void deleteJob_candidateRejected() throws Exception {
            mockMvc.perform(delete("/api/jobs/1"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(roles = "CANDIDATE")
        @DisplayName("PUT /api/jobs/{id} requires EMPLOYER — CANDIDATE rejected")
        void putJob_candidateRejected() throws Exception {
            mockMvc.perform(put("/api/jobs/1"))
                    .andExpect(status().isForbidden());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Helper assertions
    // ──────────────────────────────────────────────────────────────

    /** Matcher: status is NOT the given code (negation). */
    private static org.hamcrest.Matcher<Integer> not(int unwanted) {
        return org.hamcrest.Matchers.not(unwanted);
    }

    /** Matcher: status is one of the given codes (e.g. 200 or 204). */
    private static org.hamcrest.Matcher<Integer> allOf(int... allowed) {
        org.hamcrest.Matcher<Integer>[] matchers = new org.hamcrest.Matcher[allowed.length];
        for (int i = 0; i < allowed.length; i++) {
            matchers[i] = org.hamcrest.Matchers.is(allowed[i]);
        }
        return org.hamcrest.Matchers.anyOf(matchers);
    }
}

package com.iting.jobportal.security;

import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.security.AuthUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security test for Role-Based Access Control (RBAC) logic.
 * Validates role normalization, authority mapping, and privilege boundaries.
 */
@DisplayName("RBAC Security Tests")
class RbacSecurityTest {

    // ──────────────────────────────────────────────────────────────
    // 1. Role Normalization (Legacy → Standard)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Role Normalization")
    class RoleNormalizationTests {

        @Test
        @DisplayName("USER role should normalize to CANDIDATE")
        void userRole_shouldNormalizeToCAndidate() {
            assertEquals(Role.CANDIDATE, Role.USER.normalize());
        }

        @Test
        @DisplayName("COMPANY role should normalize to EMPLOYER")
        void companyRole_shouldNormalizeToEmployer() {
            assertEquals(Role.EMPLOYER, Role.COMPANY.normalize());
        }

        @Test
        @DisplayName("CANDIDATE role should remain CANDIDATE")
        void candidateRole_shouldRemainUnchanged() {
            assertEquals(Role.CANDIDATE, Role.CANDIDATE.normalize());
        }

        @Test
        @DisplayName("EMPLOYER role should remain EMPLOYER")
        void employerRole_shouldRemainUnchanged() {
            assertEquals(Role.EMPLOYER, Role.EMPLOYER.normalize());
        }

        @Test
        @DisplayName("ADMIN role should remain ADMIN")
        void adminRole_shouldRemainUnchanged() {
            assertEquals(Role.ADMIN, Role.ADMIN.normalize());
        }

        @Test
        @DisplayName("normalizedName should return correct string representation")
        void normalizedName_shouldReturnCorrectString() {
            assertEquals("CANDIDATE", Role.USER.normalizedName());
            assertEquals("EMPLOYER", Role.COMPANY.normalizedName());
            assertEquals("ADMIN", Role.ADMIN.normalizedName());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Spring Security Authority Mapping
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Authority Mapping")
    class AuthorityMappingTests {

        private com.iting.jobportal.auth.entity.Account createAccount(Long id, Role role) {
            var account = new com.iting.jobportal.auth.entity.Account();
            account.setId(id);
            account.setEmail("test@test.com");
            account.setRole(role);
            return account;
        }

        @Test
        @DisplayName("CANDIDATE should have ROLE_CANDIDATE authority")
        void candidateAccount_shouldHaveCorrectAuthority() {
            AuthUser user = new AuthUser(createAccount(1L, Role.CANDIDATE));
            assertTrue(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE")));
        }

        @Test
        @DisplayName("EMPLOYER should have ROLE_EMPLOYER authority")
        void employerAccount_shouldHaveCorrectAuthority() {
            AuthUser user = new AuthUser(createAccount(1L, Role.EMPLOYER));
            assertTrue(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYER")));
        }

        @Test
        @DisplayName("ADMIN should have ROLE_ADMIN authority")
        void adminAccount_shouldHaveCorrectAuthority() {
            AuthUser user = new AuthUser(createAccount(1L, Role.ADMIN));
            assertTrue(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        }

        @Test
        @DisplayName("Legacy USER role should map to ROLE_CANDIDATE authority")
        void legacyUserRole_shouldMapToCandidate() {
            AuthUser user = new AuthUser(createAccount(1L, Role.USER));
            assertTrue(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE")));
        }

        @Test
        @DisplayName("Legacy COMPANY role should map to ROLE_EMPLOYER authority")
        void legacyCompanyRole_shouldMapToEmployer() {
            AuthUser user = new AuthUser(createAccount(1L, Role.COMPANY));
            assertTrue(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYER")));
        }

        @Test
        @DisplayName("Null role should default to ROLE_CANDIDATE")
        void nullRole_shouldDefaultToCandidate() {
            AuthUser user = new AuthUser(createAccount(1L, null));
            assertTrue(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE")));
        }

        @Test
        @DisplayName("Each user should have exactly one authority")
        void authority_shouldBeSingleRole() {
            AuthUser admin = new AuthUser(createAccount(1L, Role.ADMIN));
            assertEquals(1, admin.getAuthorities().size(),
                "User should have exactly one authority to prevent privilege accumulation");
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Account Status Security (Banned Account Lockout)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Account Lockout")
    class AccountLockoutTests {

        @Test
        @DisplayName("BANNED account should be locked and disabled")
        void bannedAccount_shouldBeLockedAndDisabled() {
            var account = new com.iting.jobportal.auth.entity.Account();
            account.setId(1L);
            account.setEmail("banned@test.com");
            account.setRole(Role.CANDIDATE);
            account.setStatus(com.iting.jobportal.auth.entity.Enum.AccountStatus.BANNED);

            AuthUser user = new AuthUser(account);

            assertFalse(user.isAccountNonLocked(), "Banned account should be locked");
            assertFalse(user.isEnabled(), "Banned account should be disabled");
        }

        @Test
        @DisplayName("ACTIVE account should not be locked")
        void activeAccount_shouldNotBeLocked() {
            var account = new com.iting.jobportal.auth.entity.Account();
            account.setId(1L);
            account.setEmail("active@test.com");
            account.setRole(Role.CANDIDATE);
            account.setStatus(com.iting.jobportal.auth.entity.Enum.AccountStatus.ACTIVE);

            AuthUser user = new AuthUser(account);

            assertTrue(user.isAccountNonLocked());
            assertTrue(user.isEnabled());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Role Boundary (Privilege Escalation Prevention)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Privilege Boundary")
    class PrivilegeBoundaryTests {

        @Test
        @DisplayName("CANDIDATE should not have ADMIN authority")
        void candidate_shouldNotHaveAdminAuthority() {
            var account = new com.iting.jobportal.auth.entity.Account();
            account.setId(1L);
            account.setRole(Role.CANDIDATE);
            AuthUser user = new AuthUser(account);

            assertFalse(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        }

        @Test
        @DisplayName("EMPLOYER should not have ADMIN authority")
        void employer_shouldNotHaveAdminAuthority() {
            var account = new com.iting.jobportal.auth.entity.Account();
            account.setId(1L);
            account.setRole(Role.EMPLOYER);
            AuthUser user = new AuthUser(account);

            assertFalse(user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        }

        @Test
        @DisplayName("All valid roles should produce valid authorities")
        void allRoles_shouldProduceValidAuthorities() {
            for (Role role : Role.values()) {
                var account = new com.iting.jobportal.auth.entity.Account();
                account.setId(1L);
                account.setRole(role);
                AuthUser user = new AuthUser(account);

                assertFalse(user.getAuthorities().isEmpty());
                user.getAuthorities().forEach(auth ->
                    assertTrue(auth.getAuthority().startsWith("ROLE_"),
                        "Authority must start with ROLE_ prefix"));
            }
        }
    }
}

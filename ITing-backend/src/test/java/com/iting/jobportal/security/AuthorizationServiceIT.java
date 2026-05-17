package com.iting.jobportal.security;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyHrAffiliation;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import java.time.LocalDateTime;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Service-layer security test for {@link AuthorizationService}.
 *
 * <p>Verifies the cross-tenant access boundary: HR A cannot access HR B's company.
 * Uses real Spring context + H2 database (no mocking of authz).
 *
 * <p>Tests the authorization gate that protects ALL employer-side actions
 * (job CRUD, application review, company profile edits). A bypass here
 * would compromise the entire employer module.
 */
@SpringBootTest
@ActiveProfiles("integration")
@Transactional
@DisplayName("Authorization Service IT")
class AuthorizationServiceIT {

    @Autowired private AuthorizationService authorizationService;
    @Autowired private AccountRepository accountRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private CompanyHrAffiliationRepository affiliationRepository;

    private Account hrA;
    private Account hrB;
    private Account candidate;
    private Company companyA;
    private Company companyB;

    @BeforeEach
    void setUp() {
        // HR A → Company A (approved + active)
        hrA = accountRepository.save(employer("hrA@companyA.com"));
        companyA = companyRepository.save(company("Company A", "TAX-AAA-" + System.nanoTime()));
        companyA.setActive(true);
        companyA = companyRepository.save(companyA);
        affiliationRepository.save(approvedAffiliation(hrA, companyA));

        // HR B → Company B (approved + active)
        hrB = accountRepository.save(employer("hrB@companyB.com"));
        companyB = companyRepository.save(company("Company B", "TAX-BBB-" + System.nanoTime()));
        companyB.setActive(true);
        companyB = companyRepository.save(companyB);
        affiliationRepository.save(approvedAffiliation(hrB, companyB));

        // Candidate (no affiliation)
        candidate = accountRepository.save(Account.builder()
                .email("candidate@test.com")
                .passwordHash("$2a$10$hashed")
                .role(Role.CANDIDATE)
                .fullName("Candidate")
                .build());
    }

    // ──────────────────────────────────────────────────────────────
    // 1. requireApprovedCompanyOf — happy path
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Happy Path")
    class HappyPathTests {

        @Test
        @DisplayName("HR A can resolve their own approved+active company")
        void hrA_resolvesCompanyA() {
            Long resolvedCompanyId = authorizationService.requireApprovedCompanyOf(hrA.getId());

            assertThat(resolvedCompanyId).isEqualTo(companyA.getId());
        }

        @Test
        @DisplayName("HR B can resolve their own company (isolation: doesn't accidentally get A)")
        void hrB_resolvesCompanyB() {
            Long resolvedCompanyId = authorizationService.requireApprovedCompanyOf(hrB.getId());

            assertThat(resolvedCompanyId)
                    .as("HR B must NOT resolve to Company A — cross-tenant isolation")
                    .isEqualTo(companyB.getId())
                    .isNotEqualTo(companyA.getId());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Cross-tenant isolation — security critical
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Cross-Tenant Isolation")
    class CrossTenantIsolationTests {

        @Test
        @DisplayName("Two HRs from different companies don't share affiliation")
        void hrA_hrB_areCompletelyIsolated() {
            Long companyAId = authorizationService.requireApprovedCompanyOf(hrA.getId());
            Long companyBId = authorizationService.requireApprovedCompanyOf(hrB.getId());

            assertThat(companyAId).isNotEqualTo(companyBId);
        }

        @Test
        @DisplayName("Candidate (no affiliation) → throws ResponseStatusException")
        void candidate_throwsForbidden() {
            assertThatThrownBy(() -> authorizationService.requireApprovedCompanyOf(candidate.getId()))
                    .isInstanceOf(ResponseStatusException.class);
        }

        @Test
        @DisplayName("Non-existent user ID → throws (no leak of internal state)")
        void nonExistentUser_throws() {
            assertThatThrownBy(() -> authorizationService.requireApprovedCompanyOf(99999L))
                    .isInstanceOf(ResponseStatusException.class);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Status boundary — only APPROVED companies pass
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Status Boundary")
    class StatusBoundaryTests {

        @Test
        @DisplayName("HR with affiliation status=PENDING → rejected")
        void pendingAffiliation_rejected() {
            Account newHr = accountRepository.save(employer("pending@test.com"));
            Company newCompany = companyRepository.save(company("Pending Co", "TAX-P-" + System.nanoTime()));
            newCompany.setActive(true);
            newCompany = companyRepository.save(newCompany);

            CompanyHrAffiliation pending = CompanyHrAffiliation.builder()
                    .hrAccount(newHr)
                    .company(newCompany)
                    .status(AffiliationStatus.PENDING)
                    .submissionStatus(SubmissionStatus.DRAFT)
                    .requestedAt(LocalDateTime.now())
                    .build();
            affiliationRepository.save(pending);

            assertThatThrownBy(() -> authorizationService.requireApprovedCompanyOf(newHr.getId()))
                    .isInstanceOf(ResponseStatusException.class);
        }

        @Test
        @DisplayName("HR with company.active=false → rejected (suspended company)")
        void inactiveCompany_rejected() {
            Account newHr = accountRepository.save(employer("inactive-hr@test.com"));
            Company suspended = companyRepository.save(company("Suspended Co", "TAX-S-" + System.nanoTime()));
            suspended.setActive(false);  // suspended company
            suspended = companyRepository.save(suspended);
            affiliationRepository.save(approvedAffiliation(newHr, suspended));

            assertThatThrownBy(() -> authorizationService.requireApprovedCompanyOf(newHr.getId()))
                    .as("Active=false should reject (company suspended/banned)")
                    .isInstanceOf(ResponseStatusException.class);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Multiple HRs at same company — both can access (legit pattern)
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Multiple HRs Same Company")
    class MultipleHrsTests {

        @Test
        @DisplayName("Two HRs at same company both resolve to same company ID")
        void twoHrs_sameCompany_bothResolveSame() {
            Account hr2 = accountRepository.save(employer("hr2@companyA.com"));
            affiliationRepository.save(approvedAffiliation(hr2, companyA));

            Long resolvedByHr1 = authorizationService.requireApprovedCompanyOf(hrA.getId());
            Long resolvedByHr2 = authorizationService.requireApprovedCompanyOf(hr2.getId());

            assertThat(resolvedByHr1).isEqualTo(resolvedByHr2).isEqualTo(companyA.getId());
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Mass assignment / privilege escalation attempts
    // ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Privilege Escalation Resistance")
    class PrivilegeEscalationTests {

        @Test
        @DisplayName("Cannot grant access by manipulating account role alone (need affiliation)")
        void roleChangeAlone_doesNotGrantCompanyAccess() {
            // Candidate has role=CANDIDATE, no affiliation
            // Even if we change role to EMPLOYER, without affiliation they shouldn't pass
            candidate.setRole(Role.EMPLOYER);
            accountRepository.save(candidate);

            assertThatThrownBy(() -> authorizationService.requireApprovedCompanyOf(candidate.getId()))
                    .as("Changing role to EMPLOYER without affiliation must not grant access")
                    .isInstanceOf(ResponseStatusException.class);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────

    private Account employer(String email) {
        return Account.builder()
                .email(email)
                .passwordHash("$2a$10$hashed")
                .role(Role.EMPLOYER)
                .fullName("Employer " + email)
                .build();
    }

    private Company company(String name, String taxCode) {
        Company c = new Company();
        c.setName(name);
        c.setTaxCode(taxCode);
        return c;
    }

    private CompanyHrAffiliation approvedAffiliation(Account hr, Company company) {
        return CompanyHrAffiliation.builder()
                .hrAccount(hr)
                .company(company)
                .status(AffiliationStatus.APPROVED)
                .submissionStatus(SubmissionStatus.APPROVED)
                .requestedAt(LocalDateTime.now())
                .build();
    }
}

package com.iting.jobportal.company.repository;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("integration")
@EnableJpaRepositories(basePackages = "com.iting.jobportal")
@EntityScan(basePackages = "com.iting.jobportal")
class CompanyReviewRepositoryIT {

    @Autowired private CompanyReviewRepository reviewRepository;
    @Autowired private TestEntityManager em;

    private Company company;
    private Company otherCompany;
    private Account user1;
    private Account user2;
    private Account user3;

    @BeforeEach
    void setUp() {
        company = em.persistAndFlush(company("Acme Corp"));
        otherCompany = em.persistAndFlush(company("Other Corp"));
        user1 = em.persistAndFlush(account("u1@test.com"));
        user2 = em.persistAndFlush(account("u2@test.com"));
        user3 = em.persistAndFlush(account("u3@test.com"));
    }

    // ── countByCompanyId ──────────────────────────────────────────

    @Test
    @DisplayName("countByCompanyId returns correct count per company")
    void countByCompanyId_isolatesPerCompany() {
        em.persistAndFlush(review(company, user1, 5, "Great"));
        em.persistAndFlush(review(company, user2, 4, "Good"));
        em.persistAndFlush(review(otherCompany, user1, 3, "OK"));

        assertThat(reviewRepository.countByCompanyId(company.getId())).isEqualTo(2L);
        assertThat(reviewRepository.countByCompanyId(otherCompany.getId())).isEqualTo(1L);
        assertThat(reviewRepository.countByCompanyId(999L)).isZero();
    }

    // ── getAverageRating ──────────────────────────────────────────

    @Test
    @DisplayName("getAverageRating returns correct average across reviews")
    void getAverageRating_calculatesCorrectAvg() {
        em.persistAndFlush(review(company, user1, 5, "5 stars"));
        em.persistAndFlush(review(company, user2, 3, "3 stars"));
        em.persistAndFlush(review(company, user3, 4, "4 stars"));

        Double avg = reviewRepository.getAverageRating(company.getId());

        assertThat(avg).isNotNull();
        assertThat(avg).isEqualTo(4.0); // (5+3+4)/3 = 4.0
    }

    @Test
    @DisplayName("getAverageRating returns null for company with no reviews")
    void getAverageRating_returnsNullForNoReviews() {
        Double avg = reviewRepository.getAverageRating(999L);

        assertThat(avg).isNull();
    }

    @Test
    @DisplayName("getAverageRating only counts reviews for that company")
    void getAverageRating_isolatesPerCompany() {
        em.persistAndFlush(review(company, user1, 5, "Acme good"));
        em.persistAndFlush(review(otherCompany, user1, 1, "Other bad"));

        assertThat(reviewRepository.getAverageRating(company.getId())).isEqualTo(5.0);
        assertThat(reviewRepository.getAverageRating(otherCompany.getId())).isEqualTo(1.0);
    }

    // ── findByCompanyIdOrderByCreatedAtDesc ───────────────────────

    @Test
    @DisplayName("findByCompanyIdOrderByCreatedAtDesc returns newest first")
    void findByCompanyIdOrderByCreatedAtDesc_sortsCorrectly() throws InterruptedException {
        CompanyReview oldR = em.persistAndFlush(review(company, user1, 5, "old"));
        Thread.sleep(10);
        CompanyReview newR = em.persistAndFlush(review(company, user2, 3, "new"));

        List<CompanyReview> result = reviewRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId());

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(newR.getId());
        assertThat(result.get(1).getId()).isEqualTo(oldR.getId());
    }

    @Test
    @DisplayName("findByCompanyIdOrderByCreatedAtDesc returns empty list when no reviews")
    void findByCompanyIdOrderByCreatedAtDesc_emptyWhenNoMatch() {
        List<CompanyReview> result = reviewRepository.findByCompanyIdOrderByCreatedAtDesc(999L);

        assertThat(result).isEmpty();
    }

    // ── helpers ───────────────────────────────────────────────────

    private Company company(String name) {
        Company c = new Company();
        c.setName(name);
        c.setTaxCode("TAX-" + System.nanoTime());
        return c;
    }

    private Account account(String email) {
        return Account.builder()
                .email(email)
                .passwordHash("$2a$10$hashed")
                .role(Role.CANDIDATE)
                .fullName("User " + email)
                .build();
    }

    private CompanyReview review(Company c, Account a, int rating, String content) {
        CompanyReview r = CompanyReview.builder()
                .company(c)
                .account(a)
                .rating(rating)
                .content(content)
                .build();
        r.setCreatedAt(LocalDateTime.now());
        return r;
    }
}

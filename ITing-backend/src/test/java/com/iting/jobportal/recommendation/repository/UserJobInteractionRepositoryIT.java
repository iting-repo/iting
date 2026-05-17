package com.iting.jobportal.recommendation.repository;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.recommendation.entity.UserJobInteraction;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("integration")
@EnableJpaRepositories(basePackages = "com.iting.jobportal")
@EntityScan(basePackages = "com.iting.jobportal")
class UserJobInteractionRepositoryIT {

    @Autowired private UserJobInteractionRepository interactionRepository;
    @Autowired private TestEntityManager em;

    private Account user1;
    private Account user2;
    private Job job1;
    private Job job2;
    private Job job3;

    @BeforeEach
    void setUp() {
        Company company = em.persistAndFlush(company("Acme Corp"));

        user1 = em.persistAndFlush(account("u1@test.com"));
        user2 = em.persistAndFlush(account("u2@test.com"));

        job1 = em.persistAndFlush(job("Backend Dev", company));
        job2 = em.persistAndFlush(job("Frontend Dev", company));
        job3 = em.persistAndFlush(job("Fullstack Dev", company));
    }

    // ── findByAccountId ───────────────────────────────────────────

    @Test
    @DisplayName("findByAccountId returns only interactions for that account")
    void findByAccountId_isolatesPerAccount() {
        em.persistAndFlush(interaction(user1, job1, InteractionType.VIEW));
        em.persistAndFlush(interaction(user1, job2, InteractionType.APPLY));
        em.persistAndFlush(interaction(user2, job1, InteractionType.VIEW));

        List<UserJobInteraction> result = interactionRepository.findByAccountId(user1.getId());

        assertThat(result).hasSize(2);
    }

    // ── countByAccountIdAndType ───────────────────────────────────

    @Test
    @DisplayName("countByAccountIdAndType counts interactions of specific type")
    void countByAccountIdAndType_filtersCorrectly() {
        em.persistAndFlush(interaction(user1, job1, InteractionType.VIEW));
        em.persistAndFlush(interaction(user1, job2, InteractionType.VIEW));
        em.persistAndFlush(interaction(user1, job3, InteractionType.APPLY));
        em.persistAndFlush(interaction(user2, job1, InteractionType.VIEW));

        assertThat(interactionRepository.countByAccountIdAndType(user1.getId(), InteractionType.VIEW))
                .isEqualTo(2L);
        assertThat(interactionRepository.countByAccountIdAndType(user1.getId(), InteractionType.APPLY))
                .isEqualTo(1L);
        assertThat(interactionRepository.countByAccountIdAndType(user1.getId(), InteractionType.SAVE))
                .isZero();
    }

    @Test
    @DisplayName("countByAccountIdAndType returns 0 for non-existent user")
    void countByAccountIdAndType_zeroForUnknownUser() {
        long count = interactionRepository.countByAccountIdAndType(999L, InteractionType.VIEW);

        assertThat(count).isZero();
    }

    // ── sumWeightByAccountId ──────────────────────────────────────

    @Test
    @DisplayName("sumWeightByAccountId returns sum of all interaction weights")
    void sumWeightByAccountId_summarizesWeights() {
        em.persistAndFlush(interaction(user1, job1, InteractionType.VIEW));   // weight = 1
        em.persistAndFlush(interaction(user1, job2, InteractionType.APPLY));  // weight = 5
        em.persistAndFlush(interaction(user1, job3, InteractionType.SAVE));   // weight = 3

        Long sum = interactionRepository.sumWeightByAccountId(user1.getId());

        assertThat(sum).isEqualTo(
                InteractionType.VIEW.getWeight()
                        + InteractionType.APPLY.getWeight()
                        + InteractionType.SAVE.getWeight()
        );
    }

    @Test
    @DisplayName("sumWeightByAccountId returns null/zero when user has no interactions")
    void sumWeightByAccountId_zeroWhenNoInteractions() {
        Long sum = interactionRepository.sumWeightByAccountId(999L);

        // depending on @Query SUM result: could be null
        assertThat(sum == null || sum == 0L).isTrue();
    }

    // ── findAppliedJobIds ─────────────────────────────────────────

    @Test
    @DisplayName("findAppliedJobIds returns only APPLY-type job ids")
    void findAppliedJobIds_filtersToApplyOnly() {
        em.persistAndFlush(interaction(user1, job1, InteractionType.VIEW));
        em.persistAndFlush(interaction(user1, job2, InteractionType.APPLY));
        em.persistAndFlush(interaction(user1, job3, InteractionType.APPLY));

        var ids = interactionRepository.findAppliedJobIds(user1.getId());

        assertThat(ids).containsExactlyInAnyOrder(job2.getId(), job3.getId());
    }

    @Test
    @DisplayName("findAppliedJobIds returns empty for user with no APPLY interactions")
    void findAppliedJobIds_emptyForViewOnly() {
        em.persistAndFlush(interaction(user1, job1, InteractionType.VIEW));
        em.persistAndFlush(interaction(user1, job2, InteractionType.SAVE));

        var ids = interactionRepository.findAppliedJobIds(user1.getId());

        assertThat(ids).isEmpty();
    }

    @Test
    @DisplayName("Persisting interaction stores weight from InteractionType enum")
    void persistedInteraction_storesWeight() {
        UserJobInteraction saved = em.persistAndFlush(interaction(user1, job1, InteractionType.APPLY));

        UserJobInteraction reloaded = em.find(UserJobInteraction.class, saved.getId());
        assertThat(reloaded.getWeight()).isEqualTo(InteractionType.APPLY.getWeight());
        assertThat(reloaded.getInteractionType()).isEqualTo(InteractionType.APPLY);
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

    private Job job(String title, Company c) {
        return Job.builder()
                .title(title)
                .company(c)
                .build();
    }

    private UserJobInteraction interaction(Account a, Job j, InteractionType type) {
        return UserJobInteraction.builder()
                .account(a)
                .job(j)
                .interactionType(type)
                .weight(type.getWeight())
                .build();
    }
}

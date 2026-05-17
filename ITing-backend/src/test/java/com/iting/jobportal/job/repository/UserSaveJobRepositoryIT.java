package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.UserSaveJob;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("integration")
@EnableJpaRepositories(basePackages = "com.iting.jobportal")
@EntityScan(basePackages = "com.iting.jobportal")
class UserSaveJobRepositoryIT {

    @Autowired private UserSaveJobRepository userSaveJobRepository;
    @Autowired private TestEntityManager em;

    // ── countByUserId ─────────────────────────────────────────────

    @Test
    @DisplayName("countByUserId counts saves only for the target user")
    void countByUserId_isolatesPerUser() {
        em.persistAndFlush(saveJob(1L, 100L));
        em.persistAndFlush(saveJob(1L, 101L));
        em.persistAndFlush(saveJob(1L, 102L));
        em.persistAndFlush(saveJob(2L, 100L));

        assertThat(userSaveJobRepository.countByUserId(1L)).isEqualTo(3L);
        assertThat(userSaveJobRepository.countByUserId(2L)).isEqualTo(1L);
        assertThat(userSaveJobRepository.countByUserId(99L)).isZero();
    }

    // ── existsByUserIdAndJobId ────────────────────────────────────

    @Test
    @DisplayName("existsByUserIdAndJobId returns true only for matching pair")
    void existsByUserIdAndJobId_matchesExactPair() {
        em.persistAndFlush(saveJob(1L, 100L));

        assertThat(userSaveJobRepository.existsByUserIdAndJobId(1L, 100L)).isTrue();
        assertThat(userSaveJobRepository.existsByUserIdAndJobId(1L, 101L)).isFalse();
        assertThat(userSaveJobRepository.existsByUserIdAndJobId(2L, 100L)).isFalse();
    }

    // ── deleteByUserIdAndJobId ────────────────────────────────────

    @Test
    @DisplayName("deleteByUserIdAndJobId removes only the target row")
    void deleteByUserIdAndJobId_removesOnlyOneRow() {
        em.persistAndFlush(saveJob(1L, 100L));
        em.persistAndFlush(saveJob(1L, 101L));
        em.persistAndFlush(saveJob(2L, 100L));

        userSaveJobRepository.deleteByUserIdAndJobId(1L, 100L);
        em.flush();
        em.clear();

        assertThat(userSaveJobRepository.existsByUserIdAndJobId(1L, 100L)).isFalse();
        assertThat(userSaveJobRepository.existsByUserIdAndJobId(1L, 101L)).isTrue();
        assertThat(userSaveJobRepository.existsByUserIdAndJobId(2L, 100L)).isTrue();
    }

    @Test
    @DisplayName("deleteByUserIdAndJobId is idempotent (no error on missing row)")
    void deleteByUserIdAndJobId_idempotent() {
        // delete a row that doesn't exist - should not throw
        userSaveJobRepository.deleteByUserIdAndJobId(99L, 999L);
        em.flush();
    }

    // ── findAllByUserId ───────────────────────────────────────────

    @Test
    @DisplayName("findAllByUserId returns paginated results for user")
    void findAllByUserId_paginates() {
        for (int i = 0; i < 15; i++) {
            em.persistAndFlush(saveJob(1L, 100L + i));
        }
        em.persistAndFlush(saveJob(2L, 999L)); // other user, should be excluded

        Page<UserSaveJob> page1 = userSaveJobRepository.findAllByUserId(1L, PageRequest.of(0, 10));
        Page<UserSaveJob> page2 = userSaveJobRepository.findAllByUserId(1L, PageRequest.of(1, 10));

        assertThat(page1.getTotalElements()).isEqualTo(15);
        assertThat(page1.getContent()).hasSize(10);
        assertThat(page2.getContent()).hasSize(5);
    }

    @Test
    @DisplayName("findAllByUserId returns empty page when user has no saved jobs")
    void findAllByUserId_emptyForUserWithoutSaves() {
        Page<UserSaveJob> result = userSaveJobRepository.findAllByUserId(999L, PageRequest.of(0, 10));

        assertThat(result).isEmpty();
    }

    // ── findAllJobIdByUserId ──────────────────────────────────────

    @Test
    @DisplayName("findAllJobIdByUserId returns only job ids for that user")
    void findAllJobIdByUserId_returnsCorrectIds() {
        em.persistAndFlush(saveJob(1L, 100L));
        em.persistAndFlush(saveJob(1L, 101L));
        em.persistAndFlush(saveJob(1L, 102L));
        em.persistAndFlush(saveJob(2L, 999L));

        List<Long> ids = userSaveJobRepository.findAllJobIdByUserId(1L);

        assertThat(ids).containsExactlyInAnyOrder(100L, 101L, 102L);
    }

    // ── helper ────────────────────────────────────────────────────

    private UserSaveJob saveJob(Long userId, Long jobId) {
        return UserSaveJob.builder()
                .userId(userId)
                .jobId(jobId)
                .build();
    }
}

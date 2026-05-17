package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.UserFollowCompany;
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

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("integration")
@EnableJpaRepositories(basePackages = "com.iting.jobportal")
@EntityScan(basePackages = "com.iting.jobportal")
class UserFollowCompanyRepositoryIT {

    @Autowired private UserFollowCompanyRepository repo;
    @Autowired private TestEntityManager em;

    // ── existsByUserIdAndCompanyId ────────────────────────────────

    @Test
    @DisplayName("existsByUserIdAndCompanyId returns true for existing follow")
    void existsByUserIdAndCompanyId_returnsTrueForExisting() {
        em.persistAndFlush(follow(1L, 10L));

        assertThat(repo.existsByUserIdAndCompanyId(1L, 10L)).isTrue();
        assertThat(repo.existsByUserIdAndCompanyId(1L, 99L)).isFalse();
        assertThat(repo.existsByUserIdAndCompanyId(2L, 10L)).isFalse();
    }

    // ── findByUserId ──────────────────────────────────────────────

    @Test
    @DisplayName("findByUserId returns only follows for that user")
    void findByUserId_isolatesPerUser() {
        em.persistAndFlush(follow(1L, 10L));
        em.persistAndFlush(follow(1L, 20L));
        em.persistAndFlush(follow(1L, 30L));
        em.persistAndFlush(follow(2L, 10L));

        Page<UserFollowCompany> result = repo.findByUserId(1L, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getContent())
                .extracting(UserFollowCompany::getCompanyId)
                .containsExactlyInAnyOrder(10L, 20L, 30L);
    }

    @Test
    @DisplayName("findByUserId paginates correctly")
    void findByUserId_paginates() {
        for (long i = 0; i < 12; i++) {
            em.persistAndFlush(follow(1L, 100L + i));
        }

        Page<UserFollowCompany> p1 = repo.findByUserId(1L, PageRequest.of(0, 5));
        Page<UserFollowCompany> p3 = repo.findByUserId(1L, PageRequest.of(2, 5));

        assertThat(p1.getContent()).hasSize(5);
        assertThat(p3.getContent()).hasSize(2);
        assertThat(p1.getTotalPages()).isEqualTo(3);
    }

    // ── countByCompanyId ──────────────────────────────────────────

    @Test
    @DisplayName("countByCompanyId returns correct follower count")
    void countByCompanyId_returnsFollowerCount() {
        em.persistAndFlush(follow(1L, 10L));
        em.persistAndFlush(follow(2L, 10L));
        em.persistAndFlush(follow(3L, 10L));
        em.persistAndFlush(follow(1L, 20L));

        assertThat(repo.countByCompanyId(10L)).isEqualTo(3L);
        assertThat(repo.countByCompanyId(20L)).isEqualTo(1L);
        assertThat(repo.countByCompanyId(99L)).isZero();
    }

    // ── deleteByUserIdAndCompanyId ────────────────────────────────

    @Test
    @DisplayName("deleteByUserIdAndCompanyId removes specific follow")
    void deleteByUserIdAndCompanyId_removesOnlyOneRow() {
        em.persistAndFlush(follow(1L, 10L));
        em.persistAndFlush(follow(1L, 20L));
        em.persistAndFlush(follow(2L, 10L));

        repo.deleteByUserIdAndCompanyId(1L, 10L);
        em.flush();
        em.clear();

        assertThat(repo.existsByUserIdAndCompanyId(1L, 10L)).isFalse();
        assertThat(repo.existsByUserIdAndCompanyId(1L, 20L)).isTrue();
        assertThat(repo.existsByUserIdAndCompanyId(2L, 10L)).isTrue();
    }

    // ── lifecycle: follow → unfollow → re-follow ──────────────────

    @Test
    @DisplayName("Full lifecycle: follow → unfollow → re-follow works")
    void followLifecycle_works() {
        // 1. follow
        em.persistAndFlush(follow(1L, 10L));
        assertThat(repo.existsByUserIdAndCompanyId(1L, 10L)).isTrue();

        // 2. unfollow
        repo.deleteByUserIdAndCompanyId(1L, 10L);
        em.flush();
        em.clear();
        assertThat(repo.existsByUserIdAndCompanyId(1L, 10L)).isFalse();

        // 3. re-follow
        em.persistAndFlush(follow(1L, 10L));
        assertThat(repo.existsByUserIdAndCompanyId(1L, 10L)).isTrue();
    }

    // ── helper ────────────────────────────────────────────────────

    private UserFollowCompany follow(Long userId, Long companyId) {
        return UserFollowCompany.builder()
                .userId(userId)
                .companyId(companyId)
                .followDate(LocalDateTime.now())
                .build();
    }
}

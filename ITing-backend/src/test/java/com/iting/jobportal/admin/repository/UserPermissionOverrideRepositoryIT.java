package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.UserPermissionOverride;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository-layer integration test using @DataJpaTest + H2.
 *
 * <p>Loads only JPA / Hibernate / DataSource beans + @Entity classes + repositories.
 * Real SQL is executed against an in-memory H2 (PostgreSQL mode), so this verifies
 * column mappings, FK constraints, unique constraints, and derived query method names.
 *
 * <p>Each @Test runs in its own transaction that is rolled back at the end —
 * tests stay isolated without explicit cleanup.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("integration")
@EnableJpaRepositories(basePackages = "com.iting.jobportal")
@EntityScan(basePackages = "com.iting.jobportal")
class UserPermissionOverrideRepositoryIT {

    @Autowired private UserPermissionOverrideRepository overrideRepository;
    @Autowired private TestEntityManager em;

    private Account account;
    private Account admin;

    @BeforeEach
    void setUp() {
        account = createAccount("user1@test.com", Role.CANDIDATE, "User One");
        admin = createAccount("admin@test.com", Role.ADMIN, "Admin");
    }

    @Test
    @DisplayName("save + findByAccountId persists and retrieves overrides for one user")
    void findByAccountId_returnsAllOverridesForUser() {
        UserPermissionOverride o1 = saveOverride(account, "jobs.create", true);
        UserPermissionOverride o2 = saveOverride(account, "users.ban", false);
        em.flush();

        List<UserPermissionOverride> result = overrideRepository.findByAccountId(account.getId());

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserPermissionOverride::getPermissionKey)
                .containsExactlyInAnyOrder("jobs.create", "users.ban");
        assertThat(result).extracting(UserPermissionOverride::isGranted)
                .containsExactlyInAnyOrder(true, false);
    }

    @Test
    @DisplayName("findByAccountIdAndPermissionKey returns specific override")
    void findByAccountIdAndPermissionKey_returnsMatchingRecord() {
        saveOverride(account, "jobs.create", true);
        em.flush();

        Optional<UserPermissionOverride> result = overrideRepository
                .findByAccountIdAndPermissionKey(account.getId(), "jobs.create");

        assertThat(result).isPresent();
        assertThat(result.get().isGranted()).isTrue();
    }

    @Test
    @DisplayName("findByAccountIdAndPermissionKey returns empty when no match")
    void findByAccountIdAndPermissionKey_returnsEmptyWhenNoMatch() {
        Optional<UserPermissionOverride> result = overrideRepository
                .findByAccountIdAndPermissionKey(account.getId(), "nonexistent.key");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("deleteByAccountId removes all overrides for one user only")
    void deleteByAccountId_onlyDeletesTargetUserOverrides() {
        Account other = createAccount("user2@test.com", Role.CANDIDATE, "User Two");
        saveOverride(account, "jobs.create", true);
        saveOverride(account, "users.ban", false);
        saveOverride(other, "jobs.create", true);
        em.flush();

        overrideRepository.deleteByAccountId(account.getId());
        em.flush();
        em.clear();

        assertThat(overrideRepository.findByAccountId(account.getId())).isEmpty();
        assertThat(overrideRepository.findByAccountId(other.getId())).hasSize(1);
    }

    @Test
    @DisplayName("deleteByAccountIdAndPermissionKey removes only one specific override")
    void deleteByAccountIdAndPermissionKey_onlyRemovesOneRow() {
        saveOverride(account, "jobs.create", true);
        saveOverride(account, "users.ban", false);
        em.flush();

        overrideRepository.deleteByAccountIdAndPermissionKey(account.getId(), "jobs.create");
        em.flush();
        em.clear();

        List<UserPermissionOverride> remaining = overrideRepository.findByAccountId(account.getId());
        assertThat(remaining).hasSize(1);
        assertThat(remaining.get(0).getPermissionKey()).isEqualTo("users.ban");
    }

    @Test
    @DisplayName("@PrePersist sets createdAt and updatedAt on save")
    void prePersist_setsTimestamps() {
        UserPermissionOverride saved = saveOverride(account, "jobs.create", true);
        em.flush();

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("grantedBy FK is persisted and retrievable")
    void grantedBy_fkIsPersisted() {
        UserPermissionOverride o = UserPermissionOverride.builder()
                .account(account)
                .permissionKey("jobs.create")
                .granted(true)
                .grantedBy(admin)
                .build();
        UserPermissionOverride saved = overrideRepository.save(o);
        em.flush();
        em.clear();

        UserPermissionOverride reloaded = overrideRepository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getGrantedBy()).isNotNull();
        assertThat(reloaded.getGrantedBy().getEmail()).isEqualTo("admin@test.com");
    }

    // ── helpers ───────────────────────────────────────────────────

    private Account createAccount(String email, Role role, String fullName) {
        Account a = Account.builder()
                .email(email)
                .passwordHash("$2a$10$hashed")
                .role(role)
                .fullName(fullName)
                .build();
        return em.persistAndFlush(a);
    }

    private UserPermissionOverride saveOverride(Account a, String key, boolean granted) {
        UserPermissionOverride o = UserPermissionOverride.builder()
                .account(a)
                .permissionKey(key)
                .granted(granted)
                .build();
        return overrideRepository.save(o);
    }
}

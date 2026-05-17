package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.UserReport;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("integration")
@EnableJpaRepositories(basePackages = "com.iting.jobportal")
@EntityScan(basePackages = "com.iting.jobportal")
class UserReportRepositoryIT {

    @Autowired private UserReportRepository reportRepository;
    @Autowired private TestEntityManager em;

    // ── countByStatus ─────────────────────────────────────────────

    @Test
    @DisplayName("countByStatus returns correct count for each status")
    void countByStatus_returnsCorrectCount() {
        em.persistAndFlush(report("PENDING", "MEDIUM", "USER", "SPAM"));
        em.persistAndFlush(report("PENDING", "HIGH", "JOB", "SCAM"));
        em.persistAndFlush(report("RESOLVED", "MEDIUM", "USER", "SPAM"));
        em.persistAndFlush(report("DISMISSED", "LOW", "COMPANY", "OTHER"));

        assertThat(reportRepository.countByStatus("PENDING")).isEqualTo(2);
        assertThat(reportRepository.countByStatus("RESOLVED")).isEqualTo(1);
        assertThat(reportRepository.countByStatus("DISMISSED")).isEqualTo(1);
        assertThat(reportRepository.countByStatus("REVIEWING")).isZero();
    }

    @Test
    @DisplayName("countByPriority returns correct count for each priority")
    void countByPriority_returnsCorrectCount() {
        em.persistAndFlush(report("PENDING", "CRITICAL", "USER", "SPAM"));
        em.persistAndFlush(report("PENDING", "HIGH", "USER", "SPAM"));
        em.persistAndFlush(report("PENDING", "HIGH", "JOB", "SCAM"));
        em.persistAndFlush(report("PENDING", "LOW", "USER", "OTHER"));

        assertThat(reportRepository.countByPriority("CRITICAL")).isEqualTo(1);
        assertThat(reportRepository.countByPriority("HIGH")).isEqualTo(2);
        assertThat(reportRepository.countByPriority("LOW")).isEqualTo(1);
        assertThat(reportRepository.countByPriority("MEDIUM")).isZero();
    }

    @Test
    @DisplayName("countByTargetType returns correct count grouped by target type")
    void countByTargetType_returnsCorrectCount() {
        em.persistAndFlush(report("PENDING", "MEDIUM", "USER", "SPAM"));
        em.persistAndFlush(report("PENDING", "MEDIUM", "USER", "SCAM"));
        em.persistAndFlush(report("PENDING", "MEDIUM", "JOB", "OTHER"));
        em.persistAndFlush(report("PENDING", "MEDIUM", "COMPANY", "OTHER"));

        assertThat(reportRepository.countByTargetType("USER")).isEqualTo(2);
        assertThat(reportRepository.countByTargetType("JOB")).isEqualTo(1);
        assertThat(reportRepository.countByTargetType("COMPANY")).isEqualTo(1);
    }

    // ── findByStatusOrderByCreatedAtDesc ──────────────────────────

    @Test
    @DisplayName("findByStatusOrderByCreatedAtDesc returns matching reports newest-first")
    void findByStatusOrderByCreatedAtDesc_filtersAndSorts() throws InterruptedException {
        UserReport oldR = em.persistAndFlush(report("PENDING", "MEDIUM", "USER", "SPAM"));
        Thread.sleep(10); // ensure createdAt differs
        UserReport newR = em.persistAndFlush(report("PENDING", "MEDIUM", "JOB", "OTHER"));
        em.persistAndFlush(report("RESOLVED", "MEDIUM", "USER", "SPAM"));

        Page<UserReport> result = reportRepository
                .findByStatusOrderByCreatedAtDesc("PENDING", PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent().get(0).getId()).isEqualTo(newR.getId());
        assertThat(result.getContent().get(1).getId()).isEqualTo(oldR.getId());
    }

    @Test
    @DisplayName("findByStatusOrderByCreatedAtDesc returns empty when no match")
    void findByStatusOrderByCreatedAtDesc_emptyWhenNoMatch() {
        em.persistAndFlush(report("PENDING", "MEDIUM", "USER", "SPAM"));

        Page<UserReport> result = reportRepository
                .findByStatusOrderByCreatedAtDesc("RESOLVED", PageRequest.of(0, 10));

        assertThat(result).isEmpty();
    }

    // ── findByTargetTypeAndTargetId ───────────────────────────────

    @Test
    @DisplayName("findByTargetTypeAndTargetId returns all reports for target")
    void findByTargetTypeAndTargetId_returnsMatchingReports() {
        UserReport r1 = report("PENDING", "MEDIUM", "USER", "SPAM");
        r1.setTargetId(42L);
        UserReport r2 = report("PENDING", "HIGH", "USER", "HARASSMENT");
        r2.setTargetId(42L);
        UserReport r3 = report("PENDING", "MEDIUM", "USER", "SPAM");
        r3.setTargetId(99L);
        UserReport r4 = report("PENDING", "MEDIUM", "JOB", "OTHER");
        r4.setTargetId(42L);

        em.persistAndFlush(r1);
        em.persistAndFlush(r2);
        em.persistAndFlush(r3);
        em.persistAndFlush(r4);

        List<UserReport> result = reportRepository.findByTargetTypeAndTargetId("USER", 42L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserReport::getType)
                .containsExactlyInAnyOrder("SPAM", "HARASSMENT");
    }

    @Test
    @DisplayName("Default status defaults to PENDING via @PrePersist or column default")
    void persistedReport_storesProvidedStatusAndPriority() {
        UserReport saved = em.persistAndFlush(report("PENDING", "MEDIUM", "USER", "SPAM"));

        UserReport reloaded = em.find(UserReport.class, saved.getId());
        assertThat(reloaded.getStatus()).isEqualTo("PENDING");
        assertThat(reloaded.getPriority()).isEqualTo("MEDIUM");
        assertThat(reloaded.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("handledBy + handledAt fields are persisted correctly")
    void handledFields_arePersisted() {
        UserReport r = report("RESOLVED", "MEDIUM", "USER", "SPAM");
        r.setHandledBy(7L);
        r.setHandledAt(LocalDateTime.now());
        r.setAdminNote("resolved");

        UserReport saved = em.persistAndFlush(r);
        em.clear();

        UserReport reloaded = em.find(UserReport.class, saved.getId());
        assertThat(reloaded.getHandledBy()).isEqualTo(7L);
        assertThat(reloaded.getHandledAt()).isNotNull();
        assertThat(reloaded.getAdminNote()).isEqualTo("resolved");
    }

    // ── helper ────────────────────────────────────────────────────

    private UserReport report(String status, String priority, String targetType, String type) {
        UserReport r = new UserReport();
        r.setReporterId(1L);
        r.setTargetId(10L);
        r.setTargetType(targetType);
        r.setType(type);
        r.setReason("test reason");
        r.setStatus(status);
        r.setPriority(priority);
        return r;
    }
}

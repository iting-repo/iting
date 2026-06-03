package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.Account;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository
    extends JpaRepository<Account, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Account> {

  // Basic CRUD operations
  Optional<Account> findByEmail(String email);

  boolean existsByEmail(String email);

  long countByCreatedAtAfter(java.time.LocalDateTime dateTime);

  long countByCreatedAtBefore(java.time.LocalDateTime dateTime);

  long countByRole(com.iting.jobportal.auth.entity.Enum.Role role);

  java.util.List<Account> findByRole(com.iting.jobportal.auth.entity.Enum.Role role);

  // Accounts currently locked: locked_until > now()
  java.util.List<Account> findByLockedUntilAfter(java.time.LocalDateTime now);

  // ── Marketing attribution aggregates (V71). Returns rows of [utmValue, count]. ──
  @org.springframework.data.jpa.repository.Query(
      "SELECT a.utmSource AS value, COUNT(a) AS count "
          + "  FROM Account a "
          + " WHERE a.createdAt >= :since AND a.utmSource IS NOT NULL "
          + " GROUP BY a.utmSource "
          + " ORDER BY COUNT(a) DESC")
  java.util.List<Object[]> aggregateByUtmSource(
      @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

  @org.springframework.data.jpa.repository.Query(
      "SELECT a.utmMedium AS value, COUNT(a) AS count "
          + "  FROM Account a "
          + " WHERE a.createdAt >= :since AND a.utmMedium IS NOT NULL "
          + " GROUP BY a.utmMedium "
          + " ORDER BY COUNT(a) DESC")
  java.util.List<Object[]> aggregateByUtmMedium(
      @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);

  @org.springframework.data.jpa.repository.Query(
      "SELECT a.utmCampaign AS value, COUNT(a) AS count "
          + "  FROM Account a "
          + " WHERE a.createdAt >= :since AND a.utmCampaign IS NOT NULL "
          + " GROUP BY a.utmCampaign "
          + " ORDER BY COUNT(a) DESC")
  java.util.List<Object[]> aggregateByUtmCampaign(
      @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}

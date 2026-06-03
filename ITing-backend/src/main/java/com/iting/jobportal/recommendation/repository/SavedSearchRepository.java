package com.iting.jobportal.recommendation.repository;

import com.iting.jobportal.recommendation.entity.SavedSearch;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {

  List<SavedSearch> findByAccount_IdOrderByCreatedAtDesc(Long accountId);

  long countByAccount_Id(Long accountId);

  /**
   * Find saved searches that should receive an alert now: - alerts enabled - last_alert_sent_at
   * older than threshold (or null)
   */
  @Query(
      """
      SELECT s FROM SavedSearch s
       WHERE s.emailAlertsEnabled = true
         AND s.alertFrequency = :frequency
         AND (s.lastAlertSentAt IS NULL OR s.lastAlertSentAt < :threshold)
      """)
  List<SavedSearch> findDueForAlert(
      @Param("frequency") String frequency, @Param("threshold") LocalDateTime threshold);
}

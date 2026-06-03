package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.CompanyReview;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyReviewRepository extends JpaRepository<CompanyReview, Long> {
  List<CompanyReview> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

  @Query("SELECT AVG(r.rating) FROM CompanyReview r WHERE r.company.id = :companyId")
  Double getAverageRating(Long companyId);

  long countByCompanyId(Long companyId);

  // Moderation queue (V78)
  Page<CompanyReview> findByModerationStatusOrderByCreatedAtDesc(
      String moderationStatus, Pageable pageable);

  long countByModerationStatus(String moderationStatus);
}

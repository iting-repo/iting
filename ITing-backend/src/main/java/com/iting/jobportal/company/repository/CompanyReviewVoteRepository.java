package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.CompanyReviewVote;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyReviewVoteRepository extends JpaRepository<CompanyReviewVote, Long> {
  Optional<CompanyReviewVote> findByReviewIdAndAccountId(Long reviewId, Long accountId);

  long countByReviewId(Long reviewId);

  /** Cascade-delete votes khi xoá review. Cần @Modifying + @Transactional cho derived delete. */
  @org.springframework.transaction.annotation.Transactional
  @org.springframework.data.jpa.repository.Modifying
  void deleteAllByReviewId(Long reviewId);
}

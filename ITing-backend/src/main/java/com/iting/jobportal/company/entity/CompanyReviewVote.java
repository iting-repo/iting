package com.iting.jobportal.company.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/** One "helpful" vote per (review, account). Enforced by unique constraint at DB level. */
@Entity
@Table(
    name = "company_review_votes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"review_id", "account_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyReviewVote {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "review_id", nullable = false)
  private Long reviewId;

  @Column(name = "account_id", nullable = false)
  private Long accountId;

  @Column(name = "voted_at", nullable = false)
  private LocalDateTime votedAt;

  @PrePersist
  void onCreate() {
    if (votedAt == null) votedAt = LocalDateTime.now();
  }
}

package com.iting.jobportal.company.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "company_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyReview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "company_id", nullable = false)
  private Company company;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @Column(nullable = false)
  private Integer rating; // 1-5

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  // ── Glassdoor-style fields added by V78 ──
  @Column(name = "title", length = 200)
  private String title;

  @Column(name = "pros", columnDefinition = "TEXT")
  private String pros;

  @Column(name = "cons", columnDefinition = "TEXT")
  private String cons;

  // CURRENT_EMPLOYEE | FORMER_EMPLOYEE | INTERN | CONTRACTOR
  @Column(name = "work_type", length = 20)
  private String workType;

  @Column(name = "job_title", length = 150)
  private String jobTitle;

  @Column(name = "work_years")
  private Integer workYears;

  @Column(name = "salary_range_min", precision = 15, scale = 2)
  private BigDecimal salaryRangeMin;

  @Column(name = "salary_range_max", precision = 15, scale = 2)
  private BigDecimal salaryRangeMax;

  @Column(name = "would_recommend")
  private Boolean wouldRecommend;

  @Column(name = "culture_rating")
  private Integer cultureRating;

  @Column(name = "work_life_balance_rating")
  private Integer workLifeBalanceRating;

  @Column(name = "career_growth_rating")
  private Integer careerGrowthRating;

  @Column(name = "salary_benefits_rating")
  private Integer salaryBenefitsRating;

  @Column(name = "management_rating")
  private Integer managementRating;

  @Column(name = "is_anonymous", nullable = false)
  @Builder.Default
  private Boolean isAnonymous = Boolean.TRUE;

  @Column(name = "helpful_count", nullable = false)
  @Builder.Default
  private Integer helpfulCount = 0;

  @Column(name = "report_count", nullable = false)
  @Builder.Default
  private Integer reportCount = 0;

  // PENDING | APPROVED | REJECTED
  @Column(name = "moderation_status", length = 20, nullable = false)
  @Builder.Default
  private String moderationStatus = "PENDING";

  @Column(name = "moderator_note", length = 500)
  private String moderatorNote;

  @Column(name = "moderated_at")
  private LocalDateTime moderatedAt;

  @Column(name = "moderated_by")
  private Long moderatedBy;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}

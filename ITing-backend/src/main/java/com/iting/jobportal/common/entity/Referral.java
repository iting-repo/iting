package com.iting.jobportal.common.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "referrals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "referrer_id", nullable = false)
  private Account referrer;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "referred_account_id", nullable = false, unique = true)
  private Account referred;

  @Column(name = "code_used", nullable = false, length = 20)
  private String codeUsed;

  @Column(name = "signup_at", nullable = false)
  private LocalDateTime signupAt;

  /** Set when the referred user submits their first job application — qualifies for reward. */
  @Column(name = "first_application_at")
  private LocalDateTime firstApplicationAt;

  @Column(name = "rewarded", nullable = false)
  @Builder.Default
  private Boolean rewarded = false;

  @Column(name = "rewarded_at")
  private LocalDateTime rewardedAt;

  @Column(name = "reward_note", length = 255)
  private String rewardNote;

  @PrePersist
  void onCreate() {
    if (signupAt == null) signupAt = LocalDateTime.now();
  }
}

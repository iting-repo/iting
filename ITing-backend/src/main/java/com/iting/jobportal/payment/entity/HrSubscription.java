package com.iting.jobportal.payment.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "hr_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrSubscription {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @Enumerated(EnumType.STRING)
  @Column(name = "tier", nullable = false, length = 30)
  private SubscriptionTier tier;

  /** ACTIVE | EXPIRED | CANCELED | PENDING_RENEWAL */
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private String status = "ACTIVE";

  @Column(name = "started_at", nullable = false)
  private LocalDateTime startedAt;

  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "auto_renew", nullable = false)
  @Builder.Default
  private Boolean autoRenew = true;

  @Column(name = "last_payment_order_id")
  private Long lastPaymentOrderId;

  @Column(name = "canceled_at")
  private LocalDateTime canceledAt;

  @Column(name = "cancel_reason", length = 500)
  private String cancelReason;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    if (createdAt == null) createdAt = now;
    if (startedAt == null) startedAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}

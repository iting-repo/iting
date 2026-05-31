package com.iting.jobportal.payment.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/**
 * 1 payment order = 1 lần HR (hoặc candidate) mua 1 product (boost job, premium, etc).
 *
 * <p>Status flow: PENDING → PAID (webhook) | EXPIRED (timer) | CANCELED (user) | FAILED.
 */
@Entity
@Table(name = "payment_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrder {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  /** Unique short code printed in bank-transfer description so webhook can match. */
  @Column(name = "order_code", nullable = false, unique = true, length = 40)
  private String orderCode;

  /** Amount in VND (integer — no decimals). */
  @Column(name = "amount", nullable = false)
  private Long amount;

  @Column(name = "description", length = 255)
  private String description;

  @Column(name = "item_type", nullable = false, length = 30)
  private String itemType; // e.g. BOOST_JOB

  @Column(name = "item_id")
  private Long itemId; // e.g. jobId

  @Column(name = "tier", length = 20)
  private String tier; // BOOST_7D | BOOST_14D | BOOST_30D

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private PaymentStatus status = PaymentStatus.PENDING;

  @Column(name = "gateway", nullable = false, length = 20)
  @Builder.Default
  private String gateway = "SEPAY";

  @Column(name = "sepay_transaction_id", length = 100)
  private String sepayTransactionId;

  @Column(name = "sepay_gateway_name", length = 50)
  private String sepayGatewayName;

  @Column(name = "paid_amount")
  private Long paidAmount;

  @Column(name = "paid_at")
  private LocalDateTime paidAt;

  // Track activation độc lập với paid_at — order có thể PAID nhưng activation
  // chưa chạy (vd: bug item_type chưa handle ở deploy cũ, deploy mới retry).
  // Idempotency guard: chỉ activate khi activated_at IS NULL.
  @Column(name = "activated_at")
  private LocalDateTime activatedAt;

  @Column(name = "raw_webhook_payload", columnDefinition = "TEXT")
  private String rawWebhookPayload;

  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    if (createdAt == null) createdAt = LocalDateTime.now();
    if (updatedAt == null) updatedAt = createdAt;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}

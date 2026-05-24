package com.iting.jobportal.payment.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "credit_transaction")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    /** Dương = grant, âm = consume. */
    @Column(nullable = false)
    private Integer amount;

    /** Snapshot balance sau khi áp dụng giao dịch — phục vụ audit/debug. */
    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    /** SUBSCRIPTION | JOB_POST | JOB_BOOST | ADJUSTMENT | REFUND. */
    @Column(nullable = false, length = 50)
    private String source;

    /** Id liên quan: subscription.id / job.id / order.id… (optional). */
    @Column(name = "reference_id")
    private Long referenceId;

    @Column(length = 500)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

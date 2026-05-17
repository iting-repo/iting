package com.iting.jobportal.common.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "referral_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "total_invited", nullable = false)
    @Builder.Default
    private Integer totalInvited = 0;

    @Column(name = "total_signups", nullable = false)
    @Builder.Default
    private Integer totalSignups = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

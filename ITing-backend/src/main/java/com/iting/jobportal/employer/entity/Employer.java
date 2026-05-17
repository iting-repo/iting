package com.iting.jobportal.employer.entity;

import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

/**
 * Thông tin riêng của Employer (HR).
 * Các trường chung (fullName, phone, avatarUrl, email, status) đã nằm ở Account.
 */
@Entity
@Table(name = "employer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employer {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Account account;

    @Column(name = "position", length = 100)
    private String position;

    @Column(name = "verified", nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @PrePersist
    protected void onCreate() {
        if (verified == null) verified = false;
    }
}

package com.iting.jobportal.admin.entity;

import com.iting.jobportal.admin.entity.enums.AdminLevel;
import com.iting.jobportal.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

/**
 * Admin-specific extension of {@link Account} (1-1 via @MapsId).
 *
 * <p>Login + contact (email, password, full_name, phone, avatar_url, last_login_*, login_count)
 * lives on Account. This entity only holds admin-specific fields: staff code, admin level,
 * activation flag (semantic riêng — không trùng Account.status), free-form notes.
 */
@Entity
@Table(name = "admin_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Account account;

    @Column(name = "staff_code", length = 50, unique = true)
    private String staffCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "admin_level", length = 20)
    private AdminLevel adminLevel;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(length = 500)
    private String notes;
}

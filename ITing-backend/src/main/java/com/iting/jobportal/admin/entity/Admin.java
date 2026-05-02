package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity đại diện cho tài khoản Admin
 * Khớp với tham chiếu Admin trong CompanyUploadJob và FollowCompany
 */
@Entity
@Table(name = "admin_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin { // Đổi tên từ AdminAccount thành Admin

    @Id
    @Column(name = "id")
    private Long id; // ID này sẽ trùng với Account ID

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "login_count")
    private Integer loginCount = 0;

    @Column(name = "last_login_ip", length = 50)
    private String lastLoginIp;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null)
            active = true;
        if (loginCount == null)
            loginCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity quản lý vai trò trong hệ thống
 * Mỗi role có thể có nhiều permissions
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;  // SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT

    @Column(nullable = false, length = 100)
    private String name;  // Tên hiển thị: "Quản trị viên cấp cao"

    @Column(length = 255)
    private String description;

    @Column(name = "is_system_role")
    private Boolean isSystemRole = false;  // Role hệ thống không thể xóa

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Many-to-Many với Permission
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (isSystemRole == null) isSystemRole = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addPermission(Permission permission) {
        this.permissions.add(permission);
    }

    public void removePermission(Permission permission) {
        this.permissions.remove(permission);
    }

    public boolean hasPermission(String permissionCode) {
        return permissions.stream()
            .anyMatch(p -> p.getCode().equals(permissionCode));
    }
}


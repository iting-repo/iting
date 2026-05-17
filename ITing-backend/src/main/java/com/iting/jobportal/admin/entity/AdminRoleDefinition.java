package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_role_definitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRoleDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_key", nullable = false, unique = true, length = 50)
    private String roleKey;

    @Column(name = "label", nullable = false, length = 100)
    private String label;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "icon", length = 10)
    @Builder.Default
    private String icon = "👁️";

    @Column(name = "color", length = 20)
    @Builder.Default
    private String color = "#6B7280";

    @Column(name = "bg_light", length = 30)
    @Builder.Default
    private String bgLight = "bg-gray-50";

    @Column(name = "level", nullable = false)
    @Builder.Default
    private Integer level = 25;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private Boolean isSystem = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

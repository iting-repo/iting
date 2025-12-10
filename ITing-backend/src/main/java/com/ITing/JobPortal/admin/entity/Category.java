package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;  // INDUSTRY, SKILL, LOCATION

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String nameEn;  // Tên tiếng Anh

    @Column(length = 255)
    private String description;

    @Column(length = 255)
    private String icon;  // Icon URL hoặc icon name

    private Long parentId;  // Cho category phân cấp

    private Integer sortOrder;

    private Boolean active;

    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (sortOrder == null) sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


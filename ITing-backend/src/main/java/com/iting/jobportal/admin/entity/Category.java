package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Category extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;  // INDUSTRY, SKILL, LOCATION

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String nameEn;  // English name for internationalization

    @Column(length = 255)
    private String description;

    @Column(length = 500)
    private String icon;  // Icon class or image path

    private Long parentId;  // Cho category phân cấp

    private Integer sortOrder;

    private Boolean active;

    @PrePersist
    protected void onCreate() {
        if (active == null) active = true;
        if (sortOrder == null) sortOrder = 0;
    }
}

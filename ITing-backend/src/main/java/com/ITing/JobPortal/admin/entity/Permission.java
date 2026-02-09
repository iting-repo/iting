package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;

/**
 * Entity quản lý quyền hạn trong hệ thống
 * Mỗi permission đại diện cho một hành động cụ thể trên một module
 * 
 * Format: MODULE_ACTION (VD: USER_VIEW, JOB_CREATE, REPORT_DELETE)
 */
@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Permission extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;  // VD: USER_VIEW, JOB_CREATE, REPORT_DELETE

    @Column(nullable = false, length = 100)
    private String name;  // Tên hiển thị: "Xem người dùng"

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 50)
    private String module;  // USER, JOB, COMPANY, APPLICATION, REPORT, CATEGORY, CONTENT, SYSTEM

    @Column(nullable = false, length = 20)
    private String action;  // VIEW, CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    protected void onCreate() {
        if (active == null) active = true;
    }
}


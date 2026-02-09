package com.iting.jobportal.core.domain.auth;

import com.iting.jobportal.admin.entity.Permission;
import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Role extends AuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String name;
    
    @Column(length = 255)
    private String description;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();

    public boolean hasPermission(String permissionCode) {
        if (permissionCode == null || permissions == null) {
            return false;
        }

        return permissions.stream()
                .anyMatch(p -> permissionCode.equals(p.getCode()));
    }

}


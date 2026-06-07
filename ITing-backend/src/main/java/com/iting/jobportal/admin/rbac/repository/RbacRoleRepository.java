package com.iting.jobportal.admin.rbac.repository;

import com.iting.jobportal.admin.rbac.entity.RbacRole;
import com.iting.jobportal.admin.rbac.enums.PermissionScope;
import com.iting.jobportal.admin.rbac.enums.RoleStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RbacRoleRepository extends JpaRepository<RbacRole, Long> {

  List<RbacRole> findByScopeOrderBySystemRoleDescCreatedAtAsc(PermissionScope scope);

  List<RbacRole> findByStatusOrderByCreatedAtDesc(RoleStatus status);

  Optional<RbacRole> findByCode(String code);

  boolean existsByCode(String code);
}

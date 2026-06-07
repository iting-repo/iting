package com.iting.jobportal.admin.rbac.repository;

import com.iting.jobportal.admin.rbac.entity.Permission;
import com.iting.jobportal.admin.rbac.enums.PermissionScope;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

  List<Permission> findByScopeOrderByModuleAscCodeAsc(PermissionScope scope);

  List<Permission> findAllByOrderByModuleAscCodeAsc();
}

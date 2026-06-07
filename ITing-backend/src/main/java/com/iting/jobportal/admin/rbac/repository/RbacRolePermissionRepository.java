package com.iting.jobportal.admin.rbac.repository;

import com.iting.jobportal.admin.rbac.entity.RbacRolePermission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface RbacRolePermissionRepository extends JpaRepository<RbacRolePermission, Long> {

  List<RbacRolePermission> findByRoleId(Long roleId);

  @Transactional
  void deleteByRoleId(Long roleId);
}

package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.UserPermissionOverride;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPermissionOverrideRepository
    extends JpaRepository<UserPermissionOverride, Long> {
  List<UserPermissionOverride> findByAccountId(Long accountId);

  Optional<UserPermissionOverride> findByAccountIdAndPermissionKey(
      Long accountId, String permissionKey);

  void deleteByAccountId(Long accountId);

  void deleteByAccountIdAndPermissionKey(Long accountId, String permissionKey);
}

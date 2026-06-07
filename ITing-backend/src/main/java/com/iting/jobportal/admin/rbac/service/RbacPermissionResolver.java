package com.iting.jobportal.admin.rbac.service;

import com.iting.jobportal.admin.entity.UserPermissionOverride;
import com.iting.jobportal.admin.repository.UserPermissionOverrideRepository;
import com.iting.jobportal.admin.rbac.entity.Permission;
import com.iting.jobportal.admin.rbac.entity.RbacRolePermission;
import com.iting.jobportal.admin.rbac.enums.RoleStatus;
import com.iting.jobportal.admin.rbac.repository.PermissionRepository;
import com.iting.jobportal.admin.rbac.repository.RbacRolePermissionRepository;
import com.iting.jobportal.admin.rbac.repository.RbacRoleRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.AuthUser;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Tính quyền hiệu lực của một tài khoản và cung cấp {@code @perm.has('...')} cho {@code @PreAuthorize}.
 *
 * <p>Quyền hiệu lực = quyền của platform role (theo {@code Account.adminRole}) ∪ quyền của company
 * role (theo affiliation) rồi áp dụng per-user override. SUPER_ADMIN có toàn quyền (wildcard).
 */
@Component("perm")
@RequiredArgsConstructor
public class RbacPermissionResolver {

  private static final String SUPER_ADMIN = "SUPER_ADMIN";

  private final AccountRepository accountRepository;
  private final RbacRoleRepository roleRepository;
  private final RbacRolePermissionRepository rolePermissionRepository;
  private final PermissionRepository permissionRepository;
  private final CompanyHrAffiliationRepository affiliationRepository;
  private final UserPermissionOverrideRepository overrideRepository;

  /** Dùng trong @PreAuthorize("@perm.has('platform.users.delete')"). */
  public boolean has(String code) {
    Long id = currentAccountId();
    if (id == null) return false;
    return effectivePermissions(id).contains(code);
  }

  public boolean isSuperAdmin(Long accountId) {
    return accountRepository
        .findById(accountId)
        .map(a -> SUPER_ADMIN.equals(a.getAdminRole()))
        .orElse(false);
  }

  /** Tập quyền hiệu lực (code) của một tài khoản. */
  public Set<String> effectivePermissions(Long accountId) {
    Account acc = accountRepository.findById(accountId).orElse(null);
    if (acc == null) return Set.of();

    // SUPER_ADMIN → toàn bộ quyền trong catalog
    if (SUPER_ADMIN.equals(acc.getAdminRole())) {
      return permissionRepository.findAll().stream()
          .map(Permission::getCode)
          .collect(Collectors.toCollection(HashSet::new));
    }

    Set<String> result = new HashSet<>();

    // 1) Platform role theo adminRole (chỉ khi role đang ACTIVE)
    if (acc.getAdminRole() != null) {
      roleRepository
          .findByCode(acc.getAdminRole())
          .filter(r -> r.getStatus() == RoleStatus.ACTIVE)
          .ifPresent(r -> result.addAll(permissionCodesOfRole(r.getId())));
    }

    // 2) Company role theo affiliation active của HR
    affiliationRepository
        .findActiveByHrAccountId(accountId)
        .filter(a -> a.getCompanyRoleCode() != null)
        .ifPresent(
            a ->
                roleRepository
                    .findByCode(a.getCompanyRoleCode())
                    .filter(r -> r.getStatus() == RoleStatus.ACTIVE)
                    .ifPresent(r -> result.addAll(permissionCodesOfRole(r.getId()))));

    // 3) Per-user override (V63): granted=true thêm, granted=false gỡ
    for (UserPermissionOverride o : overrideRepository.findByAccountId(accountId)) {
      if (o.isGranted()) result.add(o.getPermissionKey());
      else result.remove(o.getPermissionKey());
    }
    return result;
  }

  private Set<String> permissionCodesOfRole(Long roleId) {
    return rolePermissionRepository.findByRoleId(roleId).stream()
        .map(RbacRolePermission::getPermissionCode)
        .collect(Collectors.toSet());
  }

  private Long currentAccountId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof AuthUser authUser) {
      return authUser.getId();
    }
    return null;
  }
}

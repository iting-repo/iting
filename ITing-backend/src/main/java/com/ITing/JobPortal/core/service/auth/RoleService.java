package com.iting.jobportal.core.service.auth;

import com.iting.jobportal.core.domain.auth.Role;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RoleService {
    
    Role createRole(Role role);
    
    Optional<Role> findById(Long id);
    
    Optional<Role> findByName(String name);
    
    Role updateRole(Long id, Role role);
    
    void deleteRole(Long id);
    
    List<Role> getAllRoles();
    
    Role assignPermissionsToRole(Long roleId, Set<Long> permissionIds);
    
    Role removePermissionsFromRole(Long roleId, Set<Long> permissionIds);
    
    Set<String> getPermissionCodesByRoleId(Long roleId);
    
    boolean existsByName(String name);
}

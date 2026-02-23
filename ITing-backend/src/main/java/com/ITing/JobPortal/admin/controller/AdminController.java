package com.iting.jobportal.admin.controller;

import com.iting.jobportal.core.domain.auth.Role;
import com.iting.jobportal.admin.entity.Permission;
import com.iting.jobportal.core.service.auth.RoleService;
import com.iting.jobportal.core.repository.auth.PermissionRepository;
import com.iting.jobportal.auth.repository.AccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Management", description = "APIs for role and permission management")
public class AdminController {
    
    private final RoleService roleService;
    private final PermissionRepository permissionRepository;
    private final AccountRepository accountRepository;
    
    // Role Management APIs
    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @Operation(summary = "Get all roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }
    
    @PostMapping("/roles")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @Operation(summary = "Create a new role")
    public ResponseEntity<Role> createRole(@Valid @RequestBody Role role) {
        log.info("Creating role: {}", role.getName());
        Role createdRole = roleService.createRole(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }
    
    @GetMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<Role> getRoleById(@Parameter(description = "Role ID") @PathVariable Long id) {
        return roleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @Operation(summary = "Update role")
    public ResponseEntity<Role> updateRole(
            @Parameter(description = "Role ID") @PathVariable Long id,
            @Valid @RequestBody Role role) {
        log.info("Updating role: {}", id);
        Role updatedRole = roleService.updateRole(id, role);
        return ResponseEntity.ok(updatedRole);
    }
    
    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @Operation(summary = "Delete role")
    public ResponseEntity<Void> deleteRole(@Parameter(description = "Role ID") @PathVariable Long id) {
        log.info("Deleting role: {}", id);
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
    
    // Permission Management APIs
    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    @Operation(summary = "Get all permissions")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        return ResponseEntity.ok(permissions);
    }
    
    @PostMapping("/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    @Operation(summary = "Create a new permission")
    public ResponseEntity<Permission> createPermission(@Valid @RequestBody Permission permission) {
        log.info("Creating permission: {}", permission.getCode());
        Permission createdPermission = permissionRepository.save(permission);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPermission);
    }
    
    @PutMapping("/permissions/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    @Operation(summary = "Update permission")
    public ResponseEntity<Permission> updatePermission(
            @Parameter(description = "Permission ID") @PathVariable Long id,
            @Valid @RequestBody Permission permission) {
        log.info("Updating permission: {}", id);
        Permission existingPermission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + id));
        
        existingPermission.setCode(permission.getCode());
        existingPermission.setDescription(permission.getDescription());
        
        Permission updatedPermission = permissionRepository.save(existingPermission);
        return ResponseEntity.ok(updatedPermission);
    }
    
    @DeleteMapping("/permissions/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    @Operation(summary = "Delete permission")
    public ResponseEntity<Void> deletePermission(@Parameter(description = "Permission ID") @PathVariable Long id) {
        log.info("Deleting permission: {}", id);
        permissionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    // Role-Permission Assignment APIs
    @PutMapping("/roles/{roleId}/permissions")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @Operation(summary = "Assign permissions to role")
    public ResponseEntity<Role> assignPermissionsToRole(
            @Parameter(description = "Role ID") @PathVariable Long roleId,
            @RequestBody Map<String, Set<Long>> request) {
        
        Set<Long> permissionIds = request.get("permissionIds");
        log.info("Assigning {} permissions to role: {}", permissionIds.size(), roleId);
        
        Role updatedRole = roleService.assignPermissionsToRole(roleId, permissionIds);
        return ResponseEntity.ok(updatedRole);
    }
    
    @GetMapping("/roles/{roleId}/permissions")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    @Operation(summary = "Get permissions for role")
    public ResponseEntity<Set<String>> getRolePermissions(@Parameter(description = "Role ID") @PathVariable Long roleId) {
        Set<String> permissionCodes = roleService.getPermissionCodesByRoleId(roleId);
        return ResponseEntity.ok(permissionCodes);
    }
    
    // User-Role Assignment APIs
    @PutMapping("/users/{userId}/roles")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Operation(summary = "Assign roles to user")
    public ResponseEntity<Void> assignRolesToUser(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @RequestBody Map<String, Set<Long>> request) {
        
        Set<Long> roleIds = request.get("roleIds");
        log.info("Assigning {} roles to user: {}", roleIds.size(), userId);
        
        // Implementation would go here - need to update Account entity relationship
        // This is a placeholder for the actual implementation
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/users/{userId}/permissions")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Operation(summary = "Get user permissions")
    public ResponseEntity<Set<String>> getUserPermissions(@Parameter(description = "User ID") @PathVariable Long userId) {
        Set<String> permissionCodes = accountRepository.findPermissionCodesByAccountId(userId);
        return ResponseEntity.ok(permissionCodes);
    }
}

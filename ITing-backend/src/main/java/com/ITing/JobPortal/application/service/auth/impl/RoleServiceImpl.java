package com.iting.jobportal.application.service.auth.impl;

import com.iting.jobportal.core.domain.auth.Role;
import com.iting.jobportal.admin.entity.Permission;
import com.iting.jobportal.core.repository.auth.RoleRepository;
import com.iting.jobportal.core.repository.auth.PermissionRepository;
import com.iting.jobportal.core.service.auth.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleServiceImpl implements RoleService {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    
    @Override
    public Role createRole(Role role) {
        if (roleRepository.existsByName(role.getName())) {
            throw new RuntimeException("Role already exists with name: " + role.getName());
        }
        
        Role savedRole = roleRepository.save(role);
        log.info("Created role: {} with ID: {}", savedRole.getName(), savedRole.getId());
        return savedRole;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Role> findById(Long id) {
        return roleRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }
    
    @Override
    public Role updateRole(Long id, Role role) {
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
        
        existingRole.setName(role.getName());
        existingRole.setDescription(role.getDescription());
        
        Role updatedRole = roleRepository.save(existingRole);
        log.info("Updated role: {}", updatedRole.getName());
        return updatedRole;
    }
    
    @Override
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found with id: " + id);
        }
        roleRepository.deleteById(id);
        log.info("Deleted role with ID: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @Override
    public Role assignPermissionsToRole(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        
        Set<Permission> permissions = permissionRepository.findByCodes(
                permissionIds.stream()
                        .map(String::valueOf)
                        .collect(Collectors.toSet())
        );
        
        role.getPermissions().addAll(permissions);
        Role updatedRole = roleRepository.save(role);
        
        log.info("Assigned {} permissions to role: {}", permissions.size(), role.getName());
        return updatedRole;
    }
    
    @Override
    public Role removePermissionsFromRole(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));
        
        Set<Permission> permissionsToRemove = permissionRepository.findByCodes(
                permissionIds.stream()
                        .map(String::valueOf)
                        .collect(Collectors.toSet())
        );
        
        role.getPermissions().removeAll(permissionsToRemove);
        Role updatedRole = roleRepository.save(role);
        
        log.info("Removed {} permissions from role: {}", permissionsToRemove.size(), role.getName());
        return updatedRole;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Set<String> getPermissionCodesByRoleId(Long roleId) {
        return roleRepository.findPermissionCodesByRoleId(roleId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }
}

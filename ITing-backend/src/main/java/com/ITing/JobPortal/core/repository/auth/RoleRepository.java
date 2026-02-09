package com.iting.jobportal.core.repository.auth;

import com.iting.jobportal.core.domain.auth.Role;
import com.iting.jobportal.admin.entity.Permission;
import com.iting.jobportal.auth.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.code = :permissionCode")
    Set<Role> findRolesByPermissionCode(@Param("permissionCode") String permissionCode);
    
    @Query("SELECT DISTINCT p.code FROM Role r JOIN r.permissions p WHERE r.id = :roleId")
    Set<String> findPermissionCodesByRoleId(@Param("roleId") Long roleId);
    
    @Query("SELECT DISTINCT p.code FROM Account a JOIN a.roles r JOIN r.permissions p WHERE a.id = :accountId")
    Set<String> findPermissionCodesByAccountId(@Param("accountId") Long accountId);
}

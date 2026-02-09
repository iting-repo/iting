package com.iting.jobportal.core.repository.auth;

import com.iting.jobportal.admin.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    Optional<Permission> findByCode(String code);
    
    boolean existsByCode(String code);
    
    @Query("SELECT p FROM Permission p WHERE p.code IN :codes")
    Set<Permission> findByCodes(@Param("codes") Set<String> codes);
    
    @Query("SELECT p.code FROM Permission p")
    Set<String> findAllPermissionCodes();
}

package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.core.domain.auth.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // Basic CRUD operations
    Optional<Account> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // RBAC-specific queries
    @Query("SELECT DISTINCT p.code FROM Account a JOIN a.roles r JOIN r.permissions p WHERE a.id = :accountId")
    Set<String> findPermissionCodesByAccountId(@Param("accountId") Long accountId);
    
    @Query("SELECT a FROM Account a JOIN FETCH a.roles r JOIN FETCH r.permissions WHERE a.email = :email")
    Optional<Account> findByEmailWithRolesAndPermissions(@Param("email") String email);
    
    @Query("SELECT a FROM Account a JOIN FETCH a.roles r JOIN FETCH r.permissions WHERE a.id = :id")
    Optional<Account> findByIdWithRolesAndPermissions(@Param("id") Long id);
    
    // Role-based filtering
    Page<Account> findByRolesContainingAndStatus(Role role, AccountStatus status, Pageable pageable);
    Page<Account> findByRolesContaining(Role role, Pageable pageable);
    
    // Role counting by name
    @Query("SELECT COUNT(a) FROM Account a JOIN a.roles r WHERE r.name = :roleName")
    long countByRoles_Name(@Param("roleName") String roleName);
    
    // Status-based filtering
    Page<Account> findByStatus(AccountStatus status, Pageable pageable);
    

    // Search functionality
    @Query("SELECT a FROM Account a WHERE a.email LIKE %:search% OR a.id IN (SELECT u.id FROM User u WHERE u.firstName LIKE %:search% OR u.lastName LIKE %:search%)")
    Page<Account> searchCandidates(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT a FROM Account a WHERE a.email LIKE %:search% OR a.id IN (SELECT c.id FROM Company c WHERE c.name LIKE %:search%)")
    Page<Account> searchEmployers(@Param("search") String search, Pageable pageable);
    
    // Statistics queries
    long countByStatus(AccountStatus status);
    
    @Query("SELECT COUNT(a) FROM Account a WHERE a.createdAt >= :since")
    long countCreatedAfter(@Param("since") java.time.LocalDateTime since);
    
    @Query("SELECT COUNT(a) FROM Account a WHERE a.createdAt >= :since")
    long countByCreatedAtAfter(@Param("since") java.time.LocalDateTime since);
    
    @Query("SELECT COUNT(a) FROM Account a WHERE a.lastLoginAt >= :since")
    long countActiveUsers(@Param("since") java.time.LocalDateTime since);
}
package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByEmail(String email);

    boolean existsByEmail(String email);
    
    // For Admin
    Page<Account> findByRole(Role role, Pageable pageable);
    
    Page<Account> findByStatus(AccountStatus status, Pageable pageable);
    
    Page<Account> findByRoleAndStatus(Role role, AccountStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Account a WHERE " +
           "(:keyword IS NULL OR LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:role IS NULL OR a.role = :role) " +
           "AND (:status IS NULL OR a.status = :status)")
    Page<Account> searchUsers(@Param("keyword") String keyword, 
                              @Param("role") Role role, 
                              @Param("status") AccountStatus status, 
                              Pageable pageable);
    
    // Statistics
    long countByRole(Role role);
    
    long countByStatus(AccountStatus status);
    
    long countByCreatedAtAfter(LocalDateTime since);
    
    long countByRoleAndStatus(Role role, AccountStatus status);
}

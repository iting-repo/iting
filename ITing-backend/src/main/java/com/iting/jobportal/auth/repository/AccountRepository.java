package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Account> {

    // Basic CRUD operations
    Optional<Account> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByCreatedAtAfter(java.time.LocalDateTime dateTime);

    long countByCreatedAtBefore(java.time.LocalDateTime dateTime);

    long countByRole(com.iting.jobportal.auth.entity.Enum.Role role);

    java.util.List<Account> findByRole(com.iting.jobportal.auth.entity.Enum.Role role);
}
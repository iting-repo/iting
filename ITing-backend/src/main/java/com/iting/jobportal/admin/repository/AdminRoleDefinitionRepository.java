package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.AdminRoleDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRoleDefinitionRepository extends JpaRepository<AdminRoleDefinition, Long> {

    Optional<AdminRoleDefinition> findByRoleKey(String roleKey);

    boolean existsByRoleKey(String roleKey);

    List<AdminRoleDefinition> findAllByOrderByLevelDesc();
}

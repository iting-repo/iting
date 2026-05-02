package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    // We only need the first row, as it's a singleton config
    Optional<SystemConfig> findFirstByOrderByIdAsc();
}

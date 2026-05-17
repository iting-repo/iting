package com.iting.jobportal.admin.repository;

import com.iting.jobportal.admin.entity.EnvConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvConfigRepository extends JpaRepository<EnvConfig, Long> {

    Optional<EnvConfig> findByEnvKey(String envKey);

    List<EnvConfig> findByEnvGroupOrderByEnvKeyAsc(String envGroup);

    List<EnvConfig> findAllByOrderByEnvGroupAscEnvKeyAsc();

    boolean existsByEnvKey(String envKey);

    void deleteByEnvKey(String envKey);
}

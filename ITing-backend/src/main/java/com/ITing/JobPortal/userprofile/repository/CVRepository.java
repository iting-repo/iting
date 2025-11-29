package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
    List<CV> findByUserId(Long userId);
}

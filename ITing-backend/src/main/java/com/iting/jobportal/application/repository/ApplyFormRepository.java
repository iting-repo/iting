package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplyFormRepository extends JpaRepository<ApplyForm, Long> {

  Page<ApplyForm> findByUserIdOrderByIdDesc(Long userId, Pageable pageable);

  boolean existsByUserIdAndId(Long userId, Long id);
}

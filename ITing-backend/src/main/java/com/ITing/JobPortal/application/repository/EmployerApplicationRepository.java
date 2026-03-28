package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployerApplicationRepository extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {

    @Query("SELECT s FROM ApplyFormSentToJob s WHERE s.id.jobId = :jobId")
    Page<ApplyFormSentToJob> findByJobId(@Param("jobId") Long jobId, Pageable pageable);

    Page<ApplyFormSentToJob> findByIdJobIdIn(List<Long> jobIds, Pageable pageable);

    long countByIdJobId(Long jobId);

    Optional<ApplyFormSentToJob> findByIdApplyFormId(Long applyFormId);
}

package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobApplicationRepository extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {

    @Query("SELECT COUNT(s) > 0 FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE f.userId = :userId AND s.id.jobId = :jobId")
    boolean existsByUserIdAndJobId(@Param("userId") Long userId, @Param("jobId") Long jobId);

    @Query("SELECT s FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE f.userId = :userId")
    Page<ApplyFormSentToJob> findByUserId(@Param("userId") Long userId, Pageable pageable);

    long countByStatus(com.iting.jobportal.application.entity.enums.ApplicationStatus status);

    long countByTimeSentAfter(java.time.LocalDateTime dateTime);

    long countByTimeSentBefore(java.time.LocalDateTime dateTime);
}

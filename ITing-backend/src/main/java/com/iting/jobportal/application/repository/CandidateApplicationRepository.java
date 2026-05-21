package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CandidateApplicationRepository extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {

    @Query("SELECT s FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE f.userId = :userId")
    Page<ApplyFormSentToJob> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT s FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId " +
            "WHERE f.userId = :userId AND s.status = :status")
    Page<ApplyFormSentToJob> findByUserIdAndStatus(@Param("userId") Long userId,
                                                    @Param("status") com.iting.jobportal.application.entity.enums.ApplicationStatus status,
                                                    Pageable pageable);

    @Query("SELECT COUNT(s) > 0 FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId " +
            "WHERE f.userId = :userId AND s.id.jobId = :jobId " +
            "AND s.status <> com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN")
    boolean existsByUserIdAndJobId(@Param("userId") Long userId, @Param("jobId") Long jobId);

    @Query("SELECT COUNT(s) FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE f.userId = :userId")
    long countByUserId(@Param("userId") Long userId);

    java.util.Optional<ApplyFormSentToJob> findByIdApplyFormId(Long applyFormId);

    void deleteByIdApplyFormId(Long applyFormId);
}

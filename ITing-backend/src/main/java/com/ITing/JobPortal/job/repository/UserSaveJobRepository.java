package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.UserSaveJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSaveJobRepository extends JpaRepository<UserSaveJob, UserSaveJob.UserSaveJobId> {

    long countByUserId(Long userId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    void deleteByUserIdAndJobId(Long userId, Long jobId);

    @Query("SELECT s FROM UserSaveJob s WHERE s.userId = :userId")
    Page<UserSaveJob> findAllByUserId(@Param("userId") Long userId, Pageable pageable);
}

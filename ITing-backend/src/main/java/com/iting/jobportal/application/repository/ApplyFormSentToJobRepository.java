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
public interface ApplyFormSentToJobRepository extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {

    boolean existsByIdJobIdAndIdApplyFormId(Long jobId, Long applyFormId);

    @Query("SELECT s FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE f.userId = :userId")
    Page<ApplyFormSentToJob> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT COUNT(s) > 0 FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE f.userId = :userId AND s.id.jobId = :jobId")
    boolean existsByUserIdAndJobId(@Param("userId") String userId, @Param("jobId") Long jobId);

    void deleteByIdApplyFormId(Long applyFormId);

    // Lấy tất cả đơn ứng tuyển của một job cụ thể (dùng cho employer)
    Page<ApplyFormSentToJob> findByIdJobId(Long jobId, Pageable pageable);

    // Lấy tất cả đơn ứng tuyển của nhiều jobs (dùng cho employer dashboard)
    Page<ApplyFormSentToJob> findByIdJobIdIn(java.util.List<Long> jobIds, Pageable pageable);

    // Đếm số ứng viên của một job
    long countByIdJobId(Long jobId);
}


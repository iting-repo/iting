package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    // Tìm jobs theo status
    Page<Job> findAllByStatus(JobStatus status, Pageable pageable);

    // Lấy jobs hot (sắp xếp theo lượt ứng tuyển + view)
    @Query("SELECT j FROM Job j WHERE j.status = :status ORDER BY j.applicationCount DESC, j.viewCount DESC")
    Page<Job> findHotJobs(@Param("status") JobStatus status, Pageable pageable);

    // Tìm jobs hết hạn
    @Query("SELECT j FROM Job j WHERE j.dueDate < CURRENT_DATE AND j.status = 'ACTIVE'")
    List<Job> findExpiredJobs();

    // Lấy jobs của company theo company_id (= Account ID của employer)
    @Query("SELECT j FROM Job j WHERE j.company.id = :companyId ORDER BY j.lastUpdate DESC")
    Page<Job> findByCompany_Id(@Param("companyId") Long companyId, Pageable pageable);

    // Lấy jobs của company theo company_id và status
    @Query("SELECT j FROM Job j WHERE j.company.id = :companyId AND j.status = :status ORDER BY j.createdAt DESC")
    Page<Job> findByCompany_IdAndStatus(@Param("companyId") Long companyId, @Param("status") JobStatus status, Pageable pageable);

    // Tăng view count
    @Modifying
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Job j SET j.applicationCount = j.applicationCount + 1 WHERE j.id = :id")
    void incrementApplicationCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Job j SET j.applicationCount = CASE WHEN j.applicationCount > 0 THEN j.applicationCount - 1 ELSE 0 END WHERE j.id = :id")
    void decrementApplicationCount(@Param("id") Long id);

    long countByCreatedAtAfter(java.time.LocalDateTime dateTime);
    long countByCreatedAtBefore(java.time.LocalDateTime dateTime);
    long countByStatus(JobStatus status);
    long countByCompany_IdAndStatus(Long companyId, JobStatus status);
}

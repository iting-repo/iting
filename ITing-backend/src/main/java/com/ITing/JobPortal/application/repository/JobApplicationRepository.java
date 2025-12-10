package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.JobApplication;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    
    // Kiểm tra đã ứng tuyển chưa
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    
    // Tìm đơn ứng tuyển theo user và job
    Optional<JobApplication> findByUserIdAndJobId(Long userId, Long jobId);
    
    // Lấy danh sách đơn ứng tuyển của user
    List<JobApplication> findByUserId(Long userId);
    Page<JobApplication> findByUserIdOrderByAppliedAtDesc(Long userId, Pageable pageable);
    
    // Lấy danh sách đơn ứng tuyển cho một job (cho employer)
    List<JobApplication> findByJobId(Long jobId);
    Page<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId, Pageable pageable);
    
    // Lấy danh sách đơn ứng tuyển cho employer
    List<JobApplication> findByEmployerId(Long employerId);
    Page<JobApplication> findByEmployerIdOrderByAppliedAtDesc(Long employerId, Pageable pageable);
    
    // Lọc theo trạng thái
    Page<JobApplication> findByJobIdAndStatus(Long jobId, ApplicationStatus status, Pageable pageable);
    Page<JobApplication> findByEmployerIdAndStatus(Long employerId, ApplicationStatus status, Pageable pageable);
    
    // Tìm kiếm đơn ứng tuyển nâng cao (cho employer)
    @Query("SELECT a FROM JobApplication a WHERE a.employerId = :employerId " +
           "AND (:jobId IS NULL OR a.jobId = :jobId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:keyword IS NULL OR LOWER(a.applicantName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.applicantEmail) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<JobApplication> searchApplicationsForEmployer(
            @Param("employerId") Long employerId,
            @Param("jobId") Long jobId,
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
    
    // Đếm số đơn ứng tuyển
    long countByJobId(Long jobId);
    long countByUserId(Long userId);
    long countByEmployerId(Long employerId);
    long countByJobIdAndStatus(Long jobId, ApplicationStatus status);
    long countByEmployerIdAndStatus(Long employerId, ApplicationStatus status);
}


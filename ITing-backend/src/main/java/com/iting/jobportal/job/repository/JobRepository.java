package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    
    // Tìm jobs theo employer
    List<Job> findByEmployerId(Long employerId);
    
    Page<Job> findByEmployerId(Long employerId, Pageable pageable);
    
    // Tìm jobs theo status
    List<Job> findByStatus(JobStatus status);
    
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    
    // Tìm jobs active
    Page<Job> findByStatusOrderByCreatedAtDesc(JobStatus status, Pageable pageable);
    
    // Tìm kiếm và lọc nâng cao
    @Query("SELECT j FROM Job j WHERE j.status = :status " +
           "AND (:keyword IS NULL OR LOWER(j.position) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType) " +
           "AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
           "AND (:minSalary IS NULL OR j.maxSalary >= :minSalary) " +
           "AND (:maxSalary IS NULL OR j.minSalary <= :maxSalary) " +
           "AND (:employerId IS NULL OR j.employerId = :employerId) " +
           "AND (:techRequired IS NULL OR LOWER(j.techRequired) LIKE LOWER(CONCAT('%', :techRequired, '%')))")
    Page<Job> searchJobs(
            @Param("status") JobStatus status,
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("jobType") JobType jobType,
            @Param("experienceLevel") ExperienceLevel experienceLevel,
            @Param("minSalary") Long minSalary,
            @Param("maxSalary") Long maxSalary,
            @Param("employerId") Long employerId,
            @Param("techRequired") String techRequired,
            Pageable pageable
    );
    
    // Đếm số jobs của employer
    long countByEmployerId(Long employerId);
    
    // Đếm số jobs active của employer
    long countByEmployerIdAndStatus(Long employerId, JobStatus status);
    
    // Tìm jobs hết hạn
    @Query("SELECT j FROM Job j WHERE j.dueDate < CURRENT_DATE AND j.status = 'ACTIVE'")
    List<Job> findExpiredJobs();
}

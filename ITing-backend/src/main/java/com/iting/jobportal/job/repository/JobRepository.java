package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    // Tìm jobs theo status
    List<Job> findByStatus(JobStatus status);
    
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    
    // Tìm kiếm và lọc nâng cao
    @Query("SELECT j FROM Job j WHERE j.status = :status " +
           "AND (:keyword IS NULL OR LOWER(j.position) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:minSalary IS NULL OR j.maxSalary >= :minSalary) " +
           "AND (:maxSalary IS NULL OR j.minSalary <= :maxSalary) " +
           "AND (:techRequired IS NULL OR LOWER(j.techRequired) LIKE LOWER(CONCAT('%', :techRequired, '%')))")
    Page<Job> searchJobs(
            @Param("status") JobStatus status,
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            @Param("techRequired") String techRequired,
            Pageable pageable
    );
    
    // Tìm jobs hết hạn
    @Query("SELECT j FROM Job j WHERE j.dueDate < CURRENT_DATE AND j.status = 'ACTIVE'")
    List<Job> findExpiredJobs();

    // Lấy jobs của employer theo company_id (= Account ID của employer)
    @Query("SELECT j FROM Job j WHERE j.companyId = :companyId ORDER BY j.lastUpdate DESC")
    Page<Job> findByEmployerId(@Param("companyId") Long companyId, Pageable pageable);
}

package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.CompanyReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyReviewRepository extends JpaRepository<CompanyReview, Long> {
    List<CompanyReview> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    
    @Query("SELECT AVG(r.rating) FROM CompanyReview r WHERE r.company.id = :companyId")
    Double getAverageRating(Long companyId);
    
    long countByCompanyId(Long companyId);
}

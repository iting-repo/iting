package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {
    Page<Company> findByCompanyInfoUpdateStatus(CompanyReviewStatus status, Pageable pageable);

<<<<<<< HEAD
    Optional<Company> findByTaxCode(String taxCode);
=======
    Optional<Company> findByAccount_Id(Long accountId);
>>>>>>> b0482a2a10970508963820b95c22492a2f9db0f8

    @Query("SELECT c FROM Company c WHERE c.companyInfoUpdateStatus = :infoStatus OR c.documentReviewStatus = :docStatus")
    Page<Company> findByCompanyInfoUpdateStatusOrDocumentReviewStatus(
            @Param("infoStatus") CompanyReviewStatus infoStatus,
            @Param("docStatus") DocumentReviewStatus docStatus,
            Pageable pageable);

}
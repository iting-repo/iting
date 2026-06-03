package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompanyRepository
    extends JpaRepository<Company, Long>, JpaSpecificationExecutor<Company> {
  // Force load industries trong cùng SQL — tránh LazyInit khi mapper truy
  // cập company.getIndustries() ngoài transaction (mọi admin list endpoint).
  @Override
  @EntityGraph(attributePaths = {"industries"})
  Page<Company> findAll(Pageable pageable);

  @Override
  @EntityGraph(attributePaths = {"industries"})
  Optional<Company> findById(Long id);

  Page<Company> findByCompanyReviewStatus(CompanyReviewStatus status, Pageable pageable);

  Optional<Company> findByTaxCode(String taxCode);

  @Query(
      "SELECT c FROM Company c WHERE c.companyReviewStatus = :infoStatus OR c.documentReviewStatus"
          + " = :docStatus")
  Page<Company> findByCompanyReviewStatusOrDocumentReviewStatus(
      @Param("infoStatus") CompanyReviewStatus infoStatus,
      @Param("docStatus") DocumentReviewStatus docStatus,
      Pageable pageable);
}

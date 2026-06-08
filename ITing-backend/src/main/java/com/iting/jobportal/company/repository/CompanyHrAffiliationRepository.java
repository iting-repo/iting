package com.iting.jobportal.company.repository;

import com.iting.jobportal.company.entity.CompanyHrAffiliation;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompanyHrAffiliationRepository
    extends JpaRepository<CompanyHrAffiliation, Long>,
        JpaSpecificationExecutor<CompanyHrAffiliation> {

  Optional<CompanyHrAffiliation> findByHrAccount_IdAndStatus(
      Long hrAccountId, AffiliationStatus status);

  /**
   * Affiliation đang active (INCOMPLETE/PENDING/APPROVED) của HR. Có tối đa 1 record vì có partial
   * unique index uniq_aff_active.
   */
  @Query(
      """
      SELECT a FROM CompanyHrAffiliation a
       WHERE a.hrAccount.id = :hrId
         AND a.status IN (com.iting.jobportal.company.entity.enums.AffiliationStatus.INCOMPLETE,
                          com.iting.jobportal.company.entity.enums.AffiliationStatus.PENDING,
                          com.iting.jobportal.company.entity.enums.AffiliationStatus.APPROVED)
      """)
  Optional<CompanyHrAffiliation> findActiveByHrAccountId(@Param("hrId") Long hrId);

  @Query(
      """
      SELECT a FROM CompanyHrAffiliation a
       WHERE a.hrAccount.id = :hrId
         AND a.company.id = :companyId
         AND a.status IN (com.iting.jobportal.company.entity.enums.AffiliationStatus.INCOMPLETE,
                          com.iting.jobportal.company.entity.enums.AffiliationStatus.PENDING,
                          com.iting.jobportal.company.entity.enums.AffiliationStatus.APPROVED)
      """)
  Optional<CompanyHrAffiliation> findActiveByHrAccountIdAndCompanyId(
      @Param("hrId") Long hrId, @Param("companyId") Long companyId);

  /**
   * Affiliation đang active của nhiều HR cùng lúc (batch) — dùng để resolve account → company khi
   * admin liệt kê người đăng ký, tránh N+1. JOIN FETCH company để lấy tên trong cùng query.
   */
  @Query(
      """
      SELECT a FROM CompanyHrAffiliation a JOIN FETCH a.company
       WHERE a.hrAccount.id IN :hrIds
         AND a.status IN (com.iting.jobportal.company.entity.enums.AffiliationStatus.INCOMPLETE,
                          com.iting.jobportal.company.entity.enums.AffiliationStatus.PENDING,
                          com.iting.jobportal.company.entity.enums.AffiliationStatus.APPROVED)
      """)
  List<CompanyHrAffiliation> findActiveByHrAccountIds(@Param("hrIds") List<Long> hrIds);

  long countByCompany_IdAndStatus(Long companyId, AffiliationStatus status);

  Page<CompanyHrAffiliation> findByStatus(AffiliationStatus status, Pageable pageable);

  Page<CompanyHrAffiliation> findBySubmissionStatus(
      SubmissionStatus submissionStatus, Pageable pageable);

  List<CompanyHrAffiliation> findByCompany_Id(Long companyId);

  List<CompanyHrAffiliation> findByCompany_IdAndStatus(Long companyId, AffiliationStatus status);

  // All affiliations of an HR account ordered by createdAt desc — used by GDPR export.
  List<CompanyHrAffiliation> findByHrAccount_IdOrderByCreatedAtDesc(Long hrAccountId);
}

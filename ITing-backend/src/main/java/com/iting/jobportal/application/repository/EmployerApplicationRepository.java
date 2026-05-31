package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployerApplicationRepository
    extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {

  @Query(
      "SELECT s FROM ApplyFormSentToJob s WHERE s.id.jobId = :jobId AND s.status <>"
          + " com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN")
  Page<ApplyFormSentToJob> findByJobId(@Param("jobId") Long jobId, Pageable pageable);

  @Query(
      "SELECT s FROM ApplyFormSentToJob s WHERE s.id.jobId IN :jobIds AND s.status <>"
          + " com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN")
  Page<ApplyFormSentToJob> findByIdJobIdIn(@Param("jobIds") List<Long> jobIds, Pageable pageable);

  @Query(
      "SELECT s FROM ApplyFormSentToJob s JOIN ApplyForm f ON s.id.applyFormId = f.id WHERE"
          + " s.id.jobId = :jobId AND (:status IS NOT NULL OR s.status <>"
          + " com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN) AND"
          + " (:status IS NULL OR s.status = :status) AND (:keyword IS NULL OR"
          + " LOWER(CAST(f.applicantName AS string)) LIKE :keyword)")
  Page<ApplyFormSentToJob> searchByJob(
      @Param("jobId") Long jobId,
      @Param("status") com.iting.jobportal.application.entity.enums.ApplicationStatus status,
      @Param("keyword") String keyword,
      Pageable pageable);

  @Query(
      "SELECT s FROM ApplyFormSentToJob s JOIN ApplyForm f ON s.id.applyFormId = f.id WHERE"
          + " s.id.jobId IN :jobIds AND (:status IS NOT NULL OR s.status <>"
          + " com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN) AND"
          + " (:status IS NULL OR s.status = :status) AND (:keyword IS NULL OR"
          + " LOWER(CAST(f.applicantName AS string)) LIKE :keyword)")
  Page<ApplyFormSentToJob> searchAll(
      @Param("jobIds") List<Long> jobIds,
      @Param("status") com.iting.jobportal.application.entity.enums.ApplicationStatus status,
      @Param("keyword") String keyword,
      Pageable pageable);

  @Query(
      "SELECT COUNT(s) FROM ApplyFormSentToJob s WHERE s.id.jobId = :jobId AND s.status <>"
          + " com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN")
  long countByIdJobId(@Param("jobId") Long jobId);

  @Query(
      "SELECT COUNT(s) FROM ApplyFormSentToJob s WHERE s.id.jobId IN :jobIds AND s.status <>"
          + " com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN")
  long countByIdJobIdIn(@Param("jobIds") List<Long> jobIds);

  Optional<ApplyFormSentToJob> findByIdApplyFormId(Long applyFormId);

  /** Dùng cho idempotency của HR manual create — 1 candidate chỉ 1 app/job. */
  @Query(
      "SELECT s FROM ApplyFormSentToJob s WHERE s.id.jobId = :jobId AND s.userId = :userId AND"
          + " s.status <> com.iting.jobportal.application.entity.enums.ApplicationStatus.WITHDRAWN")
  Optional<ApplyFormSentToJob> findFirstByIdJobIdAndUserId(
      @Param("jobId") Long jobId, @Param("userId") Long userId);

  /** Đếm số job-link còn lại cho applyFormId — dùng để quyết định xóa ApplyForm gốc. */
  @Query("SELECT COUNT(s) FROM ApplyFormSentToJob s WHERE s.id.applyFormId = :applyFormId")
  long countByApplyFormId(@Param("applyFormId") Long applyFormId);
}

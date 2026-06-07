package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

  // Tìm jobs theo status VÀ công ty đang hoạt động VÀ chưa hết hạn
  @Query(
      "SELECT j FROM Job j JOIN j.company c WHERE j.status = :status AND c.active = true AND"
          + " (j.dueDate IS NULL OR j.dueDate >= CURRENT_DATE)")
  Page<Job> findAllByStatus(@Param("status") JobStatus status, Pageable pageable);

  // Lấy jobs hot (sắp xếp theo lượt ứng tuyển + view) VÀ công ty đang hoạt động VÀ chưa hết hạn
  // JOIN FETCH c để eagerly load Company trong cùng SQL — admin dashboard
  // render company.name + logo ngoài tx; không có FETCH → LazyInit.
  @Query(
      "SELECT j FROM Job j JOIN FETCH j.company c WHERE j.status = :status AND c.active = true AND"
          + " (j.dueDate IS NULL OR j.dueDate >= CURRENT_DATE) ORDER BY j.applicationCount DESC,"
          + " j.viewCount DESC")
  Page<Job> findHotJobs(@Param("status") JobStatus status, Pageable pageable);

  @Query(
      "SELECT j FROM Job j WHERE j.status = :status AND (j.dueDate IS NULL OR j.dueDate >="
          + " CURRENT_DATE) ORDER BY j.createdAt DESC")
  List<Job> findTop50ByStatusOrderByCreatedAtDesc(
      @Param("status") JobStatus status, Pageable pageable);

  @Query(
      "SELECT j FROM Job j WHERE j.status = :status AND (j.dueDate IS NULL OR j.dueDate >="
          + " CURRENT_DATE) ORDER BY j.viewCount DESC")
  List<Job> findTop50ByStatusOrderByViewCountDesc(
      @Param("status") JobStatus status, Pageable pageable);

  // Saved-search alert digest: newest 5 jobs with id > lastMatchedJobId (used by V70 saved_searches
  // feature).
  List<Job> findTop5ByStatusAndIdGreaterThanOrderByCreatedAtDesc(JobStatus status, long lastJobId);

  // Tìm jobs hết hạn
  @Query("SELECT j FROM Job j WHERE j.dueDate < CURRENT_DATE AND j.status = 'ACTIVE'")
  List<Job> findExpiredJobs();

  // Lấy jobs của company theo company_id (= Account ID của employer)
  @Query("SELECT j FROM Job j WHERE j.company.id = :companyId ORDER BY j.lastUpdate DESC")
  Page<Job> findByCompany_Id(@Param("companyId") Long companyId, Pageable pageable);

  // Lấy jobs của company theo company_id và status
  @Query(
      "SELECT j FROM Job j WHERE j.company.id = :companyId AND j.status = :status ORDER BY"
          + " j.createdAt DESC")
  Page<Job> findByCompany_IdAndStatus(
      @Param("companyId") Long companyId, @Param("status") JobStatus status, Pageable pageable);

  // Tự động đóng tin: ACTIVE quá hạn (đăng trước mốc threshold) → EXPIRED
  @Modifying
  @Query(
      "UPDATE Job j SET j.status = :expired WHERE j.status = :active AND j.createdAt < :threshold")
  int expireJobsPostedBefore(
      @Param("expired") JobStatus expired,
      @Param("active") JobStatus active,
      @Param("threshold") LocalDateTime threshold);

  // Tăng view count
  @Modifying
  @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :id")
  void incrementViewCount(@Param("id") Long id);

  @Modifying
  @Query("UPDATE Job j SET j.applicationCount = j.applicationCount + 1 WHERE j.id = :id")
  void incrementApplicationCount(@Param("id") Long id);

  @Modifying
  @Query(
      "UPDATE Job j SET j.applicationCount = CASE WHEN j.applicationCount > 0 THEN"
          + " j.applicationCount - 1 ELSE 0 END WHERE j.id = :id")
  void decrementApplicationCount(@Param("id") Long id);

  long countByCreatedAtAfter(java.time.LocalDateTime dateTime);

  long countByCreatedAtBefore(java.time.LocalDateTime dateTime);

  long countByStatus(JobStatus status);

  /** Count jobs HR đã đăng từ thời điểm given — dùng cho subscription monthly quota. */
  long countByPostedByHrIdAndCreatedAtAfter(Long postedByHrId, java.time.LocalDateTime since);

  long countByCompany_IdAndStatus(Long companyId, JobStatus status);

  long countByStatusAndCreatedAtAfter(JobStatus status, java.time.LocalDateTime dateTime);

  // Count truly active jobs: status ACTIVE and not past dueDate
  @Query(
      "SELECT COUNT(j) FROM Job j WHERE j.company.id = :companyId AND j.status = 'ACTIVE' AND"
          + " (j.dueDate IS NULL OR j.dueDate >= CURRENT_DATE)")
  long countActiveAndNotExpiredByCompanyId(@Param("companyId") Long companyId);

  // ===== EMBEDDING / VECTOR SEARCH =====

  /** Tìm các job ACTIVE chưa có embedding (để batch embed) */
  @Query(
      "SELECT j FROM Job j WHERE j.status = :status AND j.jobEmbedding IS NULL ORDER BY"
          + " j.lastUpdate DESC")
  List<Job> findJobsWithoutEmbedding(@Param("status") JobStatus status, Pageable pageable);

  /** Tìm tất cả job ACTIVE có embedding (để vector search in-memory) */
  @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.jobEmbedding IS NOT NULL")
  List<Job> findAllActiveWithEmbedding();

  /**
   * Pool ứng viên cho recommendation: ACTIVE + công ty active + chưa hết hạn, sắp theo (createdAt
   * DESC). Pool rộng hơn `findTop50ByStatusOrderByCreatedAtDesc` để bao quát cả job cũ phù hợp với
   * hồ sơ user.
   */
  @Query(
      "SELECT j FROM Job j JOIN FETCH j.company c "
          + "WHERE j.status = 'ACTIVE' AND c.active = true "
          + "AND (j.dueDate IS NULL OR j.dueDate >= CURRENT_DATE) "
          + "ORDER BY j.createdAt DESC")
  List<Job> findActiveCandidatesForRecommendation(Pageable pageable);
}

package com.iting.jobportal.application.repository;

import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplyFormSentToJobRepository
    extends JpaRepository<ApplyFormSentToJob, ApplyFormSentToJobId> {

  // ✅ Kiểm tra tồn tại bằng cặp ID (JobId và ApplyFormId đều là Long)
  boolean existsByIdJobIdAndIdApplyFormId(Long jobId, Long applyFormId);

  // ✅ Tìm danh sách ứng tuyển theo UserId (Long) - Khớp với thiết kế kế thừa
  // Account/User
  @Query(
      "SELECT s FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE"
          + " f.userId = :userId")
  Page<ApplyFormSentToJob> findByUserId(@Param("userId") Long userId, Pageable pageable);

  @Query(
      "SELECT COUNT(s) FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId WHERE"
          + " f.userId = :userId")
  long countByUserId(@Param("userId") Long userId);

  // ✅ Kiểm tra ứng viên (Long) đã ứng tuyển Job (Long) chưa
  @Query(
      "SELECT COUNT(s) > 0 FROM ApplyFormSentToJob s JOIN ApplyForm f ON f.id = s.id.applyFormId"
          + " WHERE f.userId = :userId AND s.id.jobId = :jobId")
  boolean existsByUserIdAndJobId(@Param("userId") Long userId, @Param("jobId") Long jobId);

  // ✅ Xóa theo Id của đơn ứng tuyển (Long)
  void deleteByIdApplyFormId(Long applyFormId);

  java.util.Optional<ApplyFormSentToJob> findByIdApplyFormId(Long applyFormId);

  @Query("SELECT s FROM ApplyFormSentToJob s WHERE s.id.jobId = :jobId")
  Page<ApplyFormSentToJob> findByJobId(@Param("jobId") Long jobId, Pageable pageable);

  Page<ApplyFormSentToJob> findByIdJobIdIn(List<Long> jobIds, Pageable pageable);

  long countByIdJobId(Long jobId);
}

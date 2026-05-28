package com.iting.jobportal.userprofile.repository;

import com.iting.jobportal.userprofile.entity.CV;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
  List<CV> findByProfile_Id(Long profileId);

  @Query("SELECT c FROM CV c WHERE c.profile.id = :profileId ORDER BY c.uploadedAt DESC")
  List<CV> findTop3ByProfileIdOrderByUploadedAtDesc(
      @Param("profileId") Long profileId, Pageable pageable);

  long countByProfile_Id(Long profileId);

  CV findFirstByProfile_IdOrderByUploadedAtAsc(Long profileId);

  /**
   * Lấy embedding của CV "đang dùng" cho 1 candidate: ưu tiên CV `isDefault=true`, fallback CV
   * upload gần nhất. Bỏ qua CV chưa có embedding. Caller nên gọi với {@code PageRequest.of(0, 1)}
   * và lấy phần tử đầu (nếu có).
   */
  @Query(
      "SELECT c.cvEmbedding FROM CV c "
          + "WHERE c.profile.id = :profileId AND c.cvEmbedding IS NOT NULL "
          + "ORDER BY CASE WHEN c.isDefault = TRUE THEN 0 ELSE 1 END, c.uploadedAt DESC")
  List<String> findActiveCvEmbeddingByProfileId(
      @Param("profileId") Long profileId, Pageable pageable);
}

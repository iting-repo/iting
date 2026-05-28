package com.iting.jobportal.recommendation.repository;

import com.iting.jobportal.recommendation.entity.UserJobInteraction;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserJobInteractionRepository extends JpaRepository<UserJobInteraction, Long> {

  List<UserJobInteraction> findByAccountId(Long accountId);

  @Query(
      "SELECT COUNT(i) FROM UserJobInteraction i WHERE i.account.id = :accountId AND"
          + " i.interactionType = :type")
  long countByAccountIdAndType(
      @Param("accountId") Long accountId, @Param("type") InteractionType type);

  @Query("SELECT SUM(i.weight) FROM UserJobInteraction i WHERE i.account.id = :accountId")
  Long sumWeightByAccountId(@Param("accountId") Long accountId);

  /**
   * Collaborative Filtering — dùng SUM(weight) thay vì COUNT(id). Job mà user tương đồng đã APPLY
   * (weight=5) sẽ xếp cao hơn job chỉ được VIEW (weight=1).
   */
  @Query(
      value =
          """
              SELECT i2.job_id FROM user_job_interactions i2
              WHERE i2.user_id IN (
                  SELECT DISTINCT i1.user_id FROM user_job_interactions i1
                  WHERE i1.job_id IN (
                      SELECT job_id FROM user_job_interactions WHERE user_id = :userId
                  )
              )
              AND i2.job_id NOT IN (
                  SELECT job_id FROM user_job_interactions WHERE user_id = :userId
              )
              GROUP BY i2.job_id
              ORDER BY SUM(i2.weight) DESC
          """,
      nativeQuery = true)
  List<Long> findSuggestedJobsByUserInterest(@Param("userId") Long userId, Pageable pageable);

  /**
   * Lấy các job mà user đã tương tác gần đây (có weight cao nhất trước). Dùng để xây dựng
   * "behavioral preference profile" — suy ra user thích skill/location nào.
   */
  @Query(
      "SELECT i FROM UserJobInteraction i "
          + "JOIN FETCH i.job j "
          + "WHERE i.account.id = :accountId "
          + "AND j.status = 'ACTIVE' "
          + "ORDER BY i.weight DESC, i.createdAt DESC")
  List<UserJobInteraction> findRecentInteractionsWithJobs(
      @Param("accountId") Long accountId, Pageable pageable);

  /**
   * Lấy id các job mà user đã ứng tuyển (interactionType=APPLY). Dùng để loại các job này khỏi danh
   * sách đề xuất — recommend job đã apply là vô nghĩa.
   */
  @Query(
      "SELECT DISTINCT i.job.id FROM UserJobInteraction i "
          + "WHERE i.account.id = :accountId AND i.interactionType = "
          + "com.iting.jobportal.recommendation.entity.enums.InteractionType.APPLY")
  java.util.Set<Long> findAppliedJobIds(@Param("accountId") Long accountId);
}

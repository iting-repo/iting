package com.iting.jobportal.recommendation.repository;

import com.iting.jobportal.recommendation.entity.UserJobInteraction;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserJobInteractionRepository extends JpaRepository<UserJobInteraction, Long> {

    List<UserJobInteraction> findByAccountId(Long accountId);

    @Query("SELECT COUNT(i) FROM UserJobInteraction i WHERE i.account.id = :accountId AND i.interactionType = :type")
    long countByAccountIdAndType(@Param("accountId") Long accountId, @Param("type") InteractionType type);

    @Query("SELECT SUM(i.weight) FROM UserJobInteraction i WHERE i.account.id = :accountId")
    Long sumWeightByAccountId(@Param("accountId") Long accountId);

    @Query(value = """
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
        ORDER BY COUNT(i2.id) DESC
    """, nativeQuery = true)
    List<Long> findSuggestedJobsByUserInterest(@Param("userId") Long userId, Pageable pageable);
}

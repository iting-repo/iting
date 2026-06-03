package com.iting.jobportal.recommendation.repository;

import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSearchHistoryRepository extends JpaRepository<UserSearchHistory, Long> {

  List<UserSearchHistory> findByAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

  long countByAccountId(Long accountId);

  Optional<UserSearchHistory> findByIdAndAccountId(Long id, Long accountId);

  @Modifying
  @Query("delete from UserSearchHistory h where h.account.id = :accountId")
  int deleteAllByAccountId(Long accountId);
}

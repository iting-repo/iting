package com.iting.jobportal.recommendation.repository;

import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSearchHistoryRepository extends JpaRepository<UserSearchHistory, Long> {

    List<UserSearchHistory> findByAccountIdOrderByCreatedAtDesc(Long accountId, Pageable pageable);

    long countByAccountId(Long accountId);
}

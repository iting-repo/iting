package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.BanHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BanHistoryRepository extends JpaRepository<BanHistory, Long> {

  // Tìm các bản ghi ban đang có hiệu lực của một account
  List<BanHistory> findByTargetAccountIdAndIsActiveTrue(Long targetId);
}

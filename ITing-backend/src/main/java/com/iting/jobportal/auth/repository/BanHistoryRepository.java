package com.iting.jobportal.auth.repository;

import com.iting.jobportal.auth.entity.BanHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BanHistoryRepository extends JpaRepository<BanHistory, Long> {

    // Tìm các bản ghi ban đang có hiệu lực của một account
    List<BanHistory> findByTargetAccountIdAndIsActiveTrue(Long targetId);
}
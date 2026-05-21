package com.iting.jobportal.announcement.repository;

import com.iting.jobportal.announcement.entity.SystemAnnouncement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, Long> {

    /**
     * Lấy các announcement đang active & trong khoảng thời gian, sắp xếp priority desc.
     * Lọc role + route + ack ở tầng service (vì target_roles và trigger_routes là string).
     */
    @Query("""
            SELECT a FROM SystemAnnouncement a
            WHERE a.active = true
              AND (a.startAt IS NULL OR a.startAt <= :now)
              AND (a.endAt IS NULL OR a.endAt >= :now)
              AND a.id NOT IN (
                    SELECT ack.announcementId FROM AnnouncementAck ack WHERE ack.userId = :userId
              )
            ORDER BY a.priority DESC, a.id DESC
            """)
    List<SystemAnnouncement> findActiveForUser(@Param("userId") Long userId,
                                               @Param("now") LocalDateTime now);

    Page<SystemAnnouncement> findAllByOrderByPriorityDescIdDesc(Pageable pageable);
}

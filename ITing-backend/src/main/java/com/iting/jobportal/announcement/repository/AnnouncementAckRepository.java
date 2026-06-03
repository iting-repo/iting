package com.iting.jobportal.announcement.repository;

import com.iting.jobportal.announcement.entity.AnnouncementAck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementAckRepository
    extends JpaRepository<AnnouncementAck, AnnouncementAck.AnnouncementAckId> {

  boolean existsByUserIdAndAnnouncementId(Long userId, Long announcementId);
}

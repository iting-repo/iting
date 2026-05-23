package com.iting.jobportal.announcement.service;

import com.iting.jobportal.announcement.dto.AnnouncementDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SystemAnnouncementService {

    /** User: lấy announcement đang active phù hợp với role + route hiện tại + chưa ack. Tối đa 1. */
    List<AnnouncementDto> getActiveForUser(Long userId, String userRole, String currentRoute);

    /** User: đánh dấu đã ack/dismiss 1 announcement. Idempotent. */
    void ack(Long userId, Long announcementId);

    /** Admin: list paginated. */
    Page<AnnouncementDto> list(Pageable pageable);

    /** Admin: get by id. */
    AnnouncementDto get(Long id);

    /** Admin: create. */
    AnnouncementDto create(AnnouncementDto dto, Long createdBy);

    /** Admin: update. */
    AnnouncementDto update(Long id, AnnouncementDto dto);

    /** Admin: delete. */
    void delete(Long id);
}

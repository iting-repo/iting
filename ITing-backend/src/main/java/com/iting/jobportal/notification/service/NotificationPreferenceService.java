package com.iting.jobportal.notification.service;

import com.iting.jobportal.notification.dto.NotificationPreferenceDto;

public interface NotificationPreferenceService {

    /** Lấy preferences của user; nếu chưa có row → tạo default rồi trả về. */
    NotificationPreferenceDto getOrCreate(Long accountId);

    /** Update preferences. Field null trong DTO → giữ giá trị cũ (partial update). */
    NotificationPreferenceDto update(Long accountId, NotificationPreferenceDto dto);
}

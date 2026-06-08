package com.iting.jobportal.messaging.service;

import com.iting.jobportal.messaging.dto.LinkPreviewDto;

/** Lấy thẻ xem trước (Open Graph) cho một URL trong tin nhắn. */
public interface LinkPreviewService {

  /**
   * Trả về {@link LinkPreviewDto} với title/description/image lấy từ Open Graph meta của trang. Trả
   * về {@code null} nếu URL không hợp lệ, bị chặn (SSRF), hoặc không lấy được metadata.
   */
  LinkPreviewDto fetch(String url);
}

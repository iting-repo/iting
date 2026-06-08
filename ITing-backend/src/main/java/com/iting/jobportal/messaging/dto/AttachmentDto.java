package com.iting.jobportal.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Một tệp đính kèm của tin nhắn (ảnh, PDF, DOCX...). Lưu JSON trong cột messages.attachments. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDto {
  /** URL gốc (canonical) trên storage — lưu trong DB. */
  private String url;

  private String name;
  private String contentType;
  private Long size;

  /**
   * URL có chữ ký để xem/tải tạm thời (presigned). Chỉ tồn tại trong response/upload, KHÔNG lưu DB
   * (object S3 ở prefix messages/ không public).
   */
  private String viewUrl;
}

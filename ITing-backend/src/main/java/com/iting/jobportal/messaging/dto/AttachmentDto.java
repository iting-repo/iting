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
  private String url;
  private String name;
  private String contentType;
  private Long size;
}

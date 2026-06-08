package com.iting.jobportal.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Thẻ xem trước (Open Graph) cho 1 URL trong tin nhắn (YouTube, bài viết LinkedIn...). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkPreviewDto {
  private String url;
  private String title;
  private String description;
  private String image;
  private String siteName;
}

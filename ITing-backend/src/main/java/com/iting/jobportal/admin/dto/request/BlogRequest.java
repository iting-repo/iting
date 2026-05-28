package com.iting.jobportal.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogRequest {

  @NotBlank(message = "Tiêu đề không được để trống")
  @Size(max = 500, message = "Tiêu đề không được dài quá 500 ký tự")
  private String title;

  @Size(max = 500)
  private String slug;

  @Size(max = 100)
  private String category;

  private String status; // PUBLISHED, DRAFT

  private String summary;

  private String content;

  @Size(max = 1000)
  private String thumbnailUrl;

  @Size(max = 255)
  private String author;

  private Boolean isFeatured;

  @Size(max = 500)
  private String seoMetaTitle;

  private String seoMetaDescription;
}

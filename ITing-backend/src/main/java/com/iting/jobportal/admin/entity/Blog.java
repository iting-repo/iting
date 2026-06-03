package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Blog extends AuditEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 500)
  private String title;

  @Column(nullable = false, unique = true, length = 500)
  private String slug;

  @Column(length = 100)
  private String category;

  @Column(nullable = false, length = 20)
  private String status;

  @Column(columnDefinition = "TEXT")
  private String summary;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(name = "thumbnail_url", length = 1000)
  private String thumbnailUrl;

  @Column(length = 255)
  private String author;

  @Column(name = "is_featured", nullable = false)
  private Boolean isFeatured;

  @Column(name = "seo_meta_title", length = 500)
  private String seoMetaTitle;

  @Column(name = "seo_meta_description", columnDefinition = "TEXT")
  private String seoMetaDescription;

  @Column(name = "view_count", nullable = false)
  @Builder.Default
  private Long viewCount = 0L;

  @PrePersist
  protected void onCreate() {
    if (status == null) status = "DRAFT";
    if (isFeatured == null) isFeatured = false;
    if (viewCount == null) viewCount = 0L;
  }
}

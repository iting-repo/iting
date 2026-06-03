package com.iting.jobportal.admin.entity;

import com.iting.jobportal.common.entity.AuditEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "static_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class StaticContent extends AuditEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 50, unique = true)
  private String slug; // about, faq, terms, privacy, blog-xxx

  @Column(nullable = false, length = 50)
  private String type; // PAGE, FAQ, BLOG

  private String title;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(length = 255)
  private String metaDescription;

  @Column(length = 255)
  private String metaKeywords;

  @Column(length = 500)
  private String thumbnailUrl;

  private Boolean published;

  private Integer sortOrder;

  private Long authorId;

  private Long viewCount;

  private LocalDateTime publishedAt;

  @PrePersist
  protected void onCreate() {
    if (published == null) published = false;
    if (viewCount == null) viewCount = 0L;
    if (sortOrder == null) sortOrder = 0;
  }
}

package com.iting.jobportal.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "static_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaticContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String slug;  // about, faq, terms, privacy, blog-xxx

    @Column(nullable = false, length = 50)
    private String type;  // PAGE, FAQ, BLOG

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String metaDescription;

    @Column(length = 255)
    private String metaKeywords;

    @Column(length = 500)
    private String thumbnailUrl;

    private Boolean published;

    private Integer sortOrder;

    private Long authorId;

    private Long viewCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime publishedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (published == null) published = false;
        if (viewCount == null) viewCount = 0L;
        if (sortOrder == null) sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


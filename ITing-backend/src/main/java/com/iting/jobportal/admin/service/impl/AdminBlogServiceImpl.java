package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.request.BlogRequest;
import com.iting.jobportal.admin.entity.Blog;
import com.iting.jobportal.admin.repository.BlogRepository;
import com.iting.jobportal.admin.service.AdminBlogService;
import java.text.Normalizer;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminBlogServiceImpl implements AdminBlogService {

  private final BlogRepository blogRepository;

  /**
   * Sorting rule (automatic): 1. is_featured = true → always on top 2. Within same group (featured
   * / normal) → newest first (created_at DESC)
   */
  @Override
  @Transactional(readOnly = true)
  public Page<Blog> getBlogs(String keyword, String status, int page, int size) {
    Sort sort = Sort.by(Sort.Order.desc("isFeatured"), Sort.Order.desc("createdAt"));
    Pageable pageable = PageRequest.of(page, size, sort);
    String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
    String st =
        (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status))
            ? status.toUpperCase()
            : null;
    return blogRepository.searchBlogs(kw, st, pageable);
  }

  @Override
  @Transactional(readOnly = true)
  public Blog getBlogById(Long id) {
    return blogRepository
        .findById(id)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Không tìm thấy bài viết với id: " + id));
  }

  @Override
  public Blog createBlog(BlogRequest request) {
    String slug = generateSlug(request.getSlug(), request.getTitle());

    // Ensure slug is unique
    if (blogRepository.existsBySlug(slug)) {
      slug = slug + "-" + System.currentTimeMillis();
    }

    Blog blog =
        Blog.builder()
            .title(request.getTitle().trim())
            .slug(slug)
            .category(request.getCategory())
            .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "DRAFT")
            .summary(request.getSummary())
            .content(request.getContent())
            .thumbnailUrl(request.getThumbnailUrl())
            .author(request.getAuthor() != null ? request.getAuthor() : "Admin")
            .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
            .seoMetaTitle(request.getSeoMetaTitle())
            .seoMetaDescription(request.getSeoMetaDescription())
            .build();

    Blog saved = blogRepository.save(blog);
    log.info("[BLOG] Created blog id={}, title={}", saved.getId(), saved.getTitle());
    return saved;
  }

  @Override
  public Blog updateBlog(Long id, BlogRequest request) {
    Blog blog = getBlogById(id);

    blog.setTitle(request.getTitle().trim());
    blog.setCategory(request.getCategory());
    blog.setStatus(
        request.getStatus() != null ? request.getStatus().toUpperCase() : blog.getStatus());
    blog.setSummary(request.getSummary());
    blog.setContent(request.getContent());
    blog.setThumbnailUrl(request.getThumbnailUrl());
    blog.setAuthor(request.getAuthor());
    blog.setIsFeatured(
        request.getIsFeatured() != null ? request.getIsFeatured() : blog.getIsFeatured());
    blog.setSeoMetaTitle(request.getSeoMetaTitle());
    blog.setSeoMetaDescription(request.getSeoMetaDescription());

    // Update slug only if explicitly provided and different
    if (request.getSlug() != null && !request.getSlug().isBlank()) {
      String newSlug = toSlug(request.getSlug().trim());
      if (!newSlug.equals(blog.getSlug())) {
        if (blogRepository.existsBySlug(newSlug)) {
          newSlug = newSlug + "-" + System.currentTimeMillis();
        }
        blog.setSlug(newSlug);
      }
    }

    Blog saved = blogRepository.save(blog);
    log.info("[BLOG] Updated blog id={}, title={}", saved.getId(), saved.getTitle());
    return saved;
  }

  @Override
  public void deleteBlog(Long id) {
    Blog blog = getBlogById(id);
    blogRepository.delete(blog);
    log.info("[BLOG] Deleted blog id={}, title={}", id, blog.getTitle());
  }

  // ── Helpers ──

  private String generateSlug(String slugInput, String title) {
    if (slugInput != null && !slugInput.isBlank()) {
      return toSlug(slugInput.trim());
    }
    return toSlug(title.trim());
  }

  /**
   * Convert Vietnamese text to URL-friendly slug. "Xu hướng tuyển dụng IT 2024" →
   * "xu-huong-tuyen-dung-it-2024"
   */
  private String toSlug(String input) {
    String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
    // Remove diacritics
    Pattern diacriticsPattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    String noDiacritics = diacriticsPattern.matcher(normalized).replaceAll("");
    // Handle special Vietnamese chars
    noDiacritics = noDiacritics.replace("đ", "d").replace("Đ", "D");
    // Lowercase, replace spaces/special chars with hyphens
    String slug =
        noDiacritics
            .toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("[\\s]+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    return slug;
  }
}

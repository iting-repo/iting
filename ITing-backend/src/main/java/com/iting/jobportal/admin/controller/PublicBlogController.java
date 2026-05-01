package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.Blog;
import com.iting.jobportal.admin.repository.BlogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/v2/blogs")
@RequiredArgsConstructor
@Tag(name = "Public Blog", description = "APIs công khai cho bài viết blog")
public class PublicBlogController {

    private final BlogRepository blogRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách bài viết đã xuất bản (có search, phân trang, tự động sắp xếp: Nổi bật trước, mới nhất trước)")
    public ResponseEntity<Page<Blog>> getBlogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "2") int size) {
        Sort sort = Sort.by(
                Sort.Order.desc("isFeatured"),
                Sort.Order.desc("createdAt")
        );
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(blogRepository.searchBlogs(keyword, "PUBLISHED", pageable));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Lấy chi tiết bài viết theo slug")
    public ResponseEntity<Blog> getBlogBySlug(@PathVariable String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        if (!"PUBLISHED".equals(blog.getStatus())) {
            throw new RuntimeException("Bài viết chưa được xuất bản");
        }
        return ResponseEntity.ok(blog);
    }
}

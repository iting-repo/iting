package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.BlogRequest;
import com.iting.jobportal.admin.entity.Blog;
import com.iting.jobportal.admin.service.AdminBlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/blogs")
@RequiredArgsConstructor
@Tag(name = "Admin Blog Management", description = "CRUD và quản lý bài viết blog")
public class AdminBlogController {

    private final AdminBlogService adminBlogService;

    @GetMapping
    @Operation(summary = "Lấy danh sách bài viết (có search, filter, phân trang, tự động sắp xếp: Nổi bật trước, mới nhất trước)")
    public ResponseEntity<Page<Blog>> getBlogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(adminBlogService.getBlogs(keyword, status, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết bài viết")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        return ResponseEntity.ok(adminBlogService.getBlogById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo bài viết mới")
    public ResponseEntity<Blog> createBlog(@Valid @RequestBody BlogRequest request) {
        return ResponseEntity.ok(adminBlogService.createBlog(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật bài viết")
    public ResponseEntity<Blog> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody BlogRequest request) {
        return ResponseEntity.ok(adminBlogService.updateBlog(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bài viết")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id) {
        adminBlogService.deleteBlog(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa bài viết thành công"));
    }
}

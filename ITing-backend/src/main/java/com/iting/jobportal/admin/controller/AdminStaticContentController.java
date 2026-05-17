package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.StaticContent;
import com.iting.jobportal.admin.service.AdminContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/static-content")
@RequiredArgsConstructor
@Tag(name = "Admin Static Content", description = "Quản lý nội dung tĩnh (Terms, Privacy, FAQ...)")
public class AdminStaticContentController {

    private final AdminContentService contentService;

    @GetMapping
    @Operation(summary = "Lấy danh sách trang tĩnh")
    public ResponseEntity<Page<StaticContent>> list(
            @RequestParam(defaultValue = "") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(contentService.getStaticContents(type, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết trang tĩnh theo ID")
    public ResponseEntity<StaticContent> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getStaticContentById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Lấy trang tĩnh theo slug")
    public ResponseEntity<StaticContent> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(contentService.getStaticContentBySlug(slug));
    }

    @PostMapping
    @Operation(summary = "Tạo trang tĩnh mới")
    public ResponseEntity<StaticContent> create(@RequestBody StaticContent content) {
        return ResponseEntity.ok(contentService.createStaticContent(content));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật trang tĩnh")
    public ResponseEntity<StaticContent> update(@PathVariable Long id, @RequestBody StaticContent content) {
        content.setId(id);
        return ResponseEntity.ok(contentService.updateStaticContent(id, content));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa trang tĩnh")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contentService.deleteStaticContent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Xuất bản trang tĩnh")
    public ResponseEntity<StaticContent> publish(@PathVariable Long id) {
        StaticContent content = contentService.getStaticContentById(id);
        content.setPublished(true);
        content.setPublishedAt(LocalDateTime.now());
        return ResponseEntity.ok(contentService.updateStaticContent(id, content));
    }

    @PatchMapping("/{id}/unpublish")
    @Operation(summary = "Gỡ xuất bản trang tĩnh")
    public ResponseEntity<StaticContent> unpublish(@PathVariable Long id) {
        StaticContent content = contentService.getStaticContentById(id);
        content.setPublished(false);
        return ResponseEntity.ok(contentService.updateStaticContent(id, content));
    }
}

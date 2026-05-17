package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.FaqRequest;
import com.iting.jobportal.admin.entity.StaticContent;
import com.iting.jobportal.admin.repository.StaticContentRepository;
import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin/faqs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin FAQ Management", description = "CRUD và quản lý FAQ (StaticContent type=FAQ)")
public class AdminFaqController {

    private static final String FAQ_TYPE = "FAQ";

    private final StaticContentRepository contentRepository;

    @GetMapping
    @Operation(summary = "Danh sách FAQ (search + filter published + phân trang)")
    public ResponseEntity<Page<StaticContent>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Order.asc("sortOrder"), Sort.Order.desc("createdAt")));

        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        Page<StaticContent> result;

        if (hasKeyword && published != null) {
            result = contentRepository.findByTypeAndPublishedAndTitleContainingIgnoreCase(
                    FAQ_TYPE, published, keyword.trim(), pageable);
        } else if (hasKeyword) {
            result = contentRepository.findByTypeAndTitleContainingIgnoreCase(
                    FAQ_TYPE, keyword.trim(), pageable);
        } else if (published != null) {
            result = contentRepository.findByTypeAndPublished(FAQ_TYPE, published, pageable);
        } else {
            result = contentRepository.findByType(FAQ_TYPE, pageable);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết FAQ")
    public ResponseEntity<StaticContent> getById(@PathVariable Long id) {
        StaticContent faq = contentRepository.findById(id)
                .filter(c -> FAQ_TYPE.equals(c.getType()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy FAQ với ID: " + id));
        return ResponseEntity.ok(faq);
    }

    @PostMapping
    @Operation(summary = "Tạo FAQ mới")
    public ResponseEntity<StaticContent> create(@Valid @RequestBody FaqRequest request) {
        String slug = resolveSlug(request.getSlug(), request.getTitle(), null);

        StaticContent faq = StaticContent.builder()
                .type(FAQ_TYPE)
                .slug(slug)
                .title(request.getTitle().trim())
                .content(request.getContent())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .published(request.getPublished() != null ? request.getPublished() : false)
                .viewCount(0L)
                .build();

        StaticContent saved = contentRepository.save(faq);
        log.info("Created FAQ: id={}, slug={}", saved.getId(), saved.getSlug());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật FAQ")
    public ResponseEntity<StaticContent> update(
            @PathVariable Long id,
            @Valid @RequestBody FaqRequest request) {
        StaticContent existing = contentRepository.findById(id)
                .filter(c -> FAQ_TYPE.equals(c.getType()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy FAQ với ID: " + id));

        String slug = resolveSlug(request.getSlug(), request.getTitle(), existing.getSlug());

        existing.setTitle(request.getTitle().trim());
        existing.setContent(request.getContent());
        existing.setSlug(slug);
        if (request.getSortOrder() != null) existing.setSortOrder(request.getSortOrder());
        if (request.getPublished() != null) existing.setPublished(request.getPublished());

        StaticContent saved = contentRepository.save(existing);
        log.info("Updated FAQ: id={}", saved.getId());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa FAQ")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        StaticContent faq = contentRepository.findById(id)
                .filter(c -> FAQ_TYPE.equals(c.getType()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy FAQ với ID: " + id));
        contentRepository.delete(faq);
        log.info("Deleted FAQ: id={}", id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa FAQ thành công"));
    }

    @PatchMapping("/{id}/toggle-published")
    @Operation(summary = "Chuyển trạng thái xuất bản FAQ")
    public ResponseEntity<StaticContent> togglePublished(@PathVariable Long id) {
        StaticContent faq = contentRepository.findById(id)
                .filter(c -> FAQ_TYPE.equals(c.getType()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy FAQ với ID: " + id));
        faq.setPublished(!Boolean.TRUE.equals(faq.getPublished()));
        return ResponseEntity.ok(contentRepository.save(faq));
    }

    // ────────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────────

    /**
     * Resolve slug: nếu user nhập → dùng (đã chuẩn hoá). Nếu không → sinh từ title.
     * Đảm bảo unique bằng cách thêm hậu tố nếu trùng (trừ trường hợp chính nó).
     */
    private String resolveSlug(String inputSlug, String title, String currentSlug) {
        String base;
        if (inputSlug != null && !inputSlug.trim().isEmpty()) {
            base = slugify(inputSlug);
        } else {
            base = slugify("faq-" + title);
        }
        if (base.length() > 45) base = base.substring(0, 45);

        String candidate = base;
        int suffix = 1;
        while (contentRepository.existsBySlug(candidate)
                && !candidate.equals(currentSlug)) {
            candidate = base + "-" + suffix;
            if (candidate.length() > 50) {
                base = base.substring(0, Math.max(0, base.length() - 3));
                candidate = base + "-" + suffix;
            }
            suffix++;
        }
        return candidate;
    }

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");

    private String slugify(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'd');
        return NON_LATIN.matcher(normalized).replaceAll("").toLowerCase();
    }
}

package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.Category;
import com.iting.jobportal.admin.entity.StaticContent;
import com.iting.jobportal.admin.repository.CategoryRepository;
import com.iting.jobportal.admin.repository.StaticContentRepository;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Public Content", description = "APIs công khai - không cần đăng nhập")
public class PublicContentController {

    private final StaticContentRepository contentRepository;
    private final CategoryRepository categoryRepository;
    private final JobRepository jobRepository;
    private final AccountRepository accountRepository;
    private final CompanyRepository companyRepository;

    // ========================================
    // NỘI DUNG TĨNH
    // ========================================

    @GetMapping("/pages/{slug}")
    @Operation(summary = "Lấy nội dung trang (about, terms, privacy, etc.)")
    public ResponseEntity<StaticContent> getPage(@PathVariable String slug) {
        StaticContent content = contentRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Page not found"));
        
        if (!content.getPublished()) {
            throw new RuntimeException("Page not published");
        }
        
        // Tăng view count
        content.setViewCount(content.getViewCount() + 1);
        contentRepository.save(content);
        
        return ResponseEntity.ok(content);
    }

    @GetMapping("/faqs")
    @Operation(summary = "Lấy danh sách FAQ")
    public ResponseEntity<List<StaticContent>> getFAQs() {
        return ResponseEntity.ok(contentRepository.findByTypeAndPublishedOrderBySortOrderAsc("FAQ", true));
    }

    @GetMapping("/blogs")
    @Operation(summary = "Lấy danh sách bài blog")
    public ResponseEntity<List<StaticContent>> getBlogs() {
        return ResponseEntity.ok(contentRepository.findByTypeAndPublishedOrderBySortOrderAsc("BLOG", true));
    }

    // ========================================
    // DANH MỤC
    // ========================================

    @GetMapping("/categories/industries")
    @Operation(summary = "Lấy danh sách ngành nghề")
    public ResponseEntity<List<Category>> getIndustries() {
        return ResponseEntity.ok(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc("INDUSTRY", true));
    }

    @GetMapping("/categories/skills")
    @Operation(summary = "Lấy danh sách kỹ năng")
    public ResponseEntity<List<Category>> getSkills() {
        return ResponseEntity.ok(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc("SKILL", true));
    }

    @GetMapping("/categories/locations")
    @Operation(summary = "Lấy danh sách địa điểm")
    public ResponseEntity<List<Category>> getLocations() {
        return ResponseEntity.ok(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc("LOCATION", true));
    }

    @GetMapping("/categories/{type}")
    @Operation(summary = "Lấy danh mục theo loại")
    public ResponseEntity<List<Category>> getCategoriesByType(@PathVariable String type) {
        return ResponseEntity.ok(categoryRepository.findByTypeAndActiveOrderBySortOrderAsc(type.toUpperCase(), true));
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy số liệu thống kê chung (jobs, candidates, companies)")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalJobs", jobRepository.countByStatus(JobStatus.ACTIVE));
        stats.put("totalCandidates", accountRepository.countByRole(Role.CANDIDATE) + accountRepository.countByRole(Role.USER));
        stats.put("totalCompanies", companyRepository.count());
        return ResponseEntity.ok(stats);
    }
}


package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.CategoryReorderRequest;
import com.iting.jobportal.admin.dto.request.CategoryRequest;
import com.iting.jobportal.admin.dto.response.CategoryResponse;
import com.iting.jobportal.admin.service.AdminContentService;
import com.iting.jobportal.company.entity.enums.Industry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "11. Admin Categories")
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

  private final AdminContentService adminContentService;

  @GetMapping
  @Operation(summary = "Lấy tất cả danh mục theo loại (SKILL, LOCATION, INDUSTRY)")
  public ResponseEntity<List<CategoryResponse>> getCategoriesByType(@RequestParam String type) {
    List<CategoryResponse> categories =
        adminContentService.getCategoriesByType(type).stream()
            .map(CategoryResponse::fromEntity)
            .toList();
    return ResponseEntity.ok(categories);
  }

  @GetMapping("/summary")
  @Operation(summary = "Lấy tổng quan số lượng từng loại danh mục")
  public ResponseEntity<Map<String, Long>> getCategorySummary() {
    return ResponseEntity.ok(adminContentService.getCategorySummary());
  }

  @GetMapping("/industries/enum")
  @Operation(summary = "Lấy danh sách ngành nghề từ Industry enum (hệ thống)")
  public ResponseEntity<List<Map<String, String>>> getIndustryEnumValues() {
    List<Map<String, String>> result =
        Arrays.stream(Industry.values())
            .map(
                i -> {
                  Map<String, String> item = new LinkedHashMap<>();
                  item.put("value", i.name());
                  item.put("name", i.getDisplayName());
                  item.put("nameEn", i.getDisplayNameEn());
                  return item;
                })
            .collect(Collectors.toList());
    return ResponseEntity.ok(result);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Lấy chi tiết một danh mục")
  public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
    return ResponseEntity.ok(CategoryResponse.fromEntity(adminContentService.getCategoryById(id)));
  }

  @PostMapping
  @Operation(summary = "Tạo danh mục mới")
  public ResponseEntity<CategoryResponse> createCategory(
      @RequestParam String type, @Valid @RequestBody CategoryRequest request) {
    CategoryResponse response =
        CategoryResponse.fromEntity(
            adminContentService.createCategoryFromRequest(type.toUpperCase(), request));
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Cập nhật danh mục")
  public ResponseEntity<CategoryResponse> updateCategory(
      @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
    CategoryResponse response =
        CategoryResponse.fromEntity(adminContentService.updateCategoryFromRequest(id, request));
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Xóa danh mục")
  public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
    adminContentService.deleteCategory(id);
    return ResponseEntity.ok(Map.of("message", "Đã xóa danh mục thành công"));
  }

  @PatchMapping("/{id}/toggle-active")
  @Operation(summary = "Bật/tắt trạng thái active của danh mục")
  public ResponseEntity<CategoryResponse> toggleActive(@PathVariable Long id) {
    CategoryResponse response =
        CategoryResponse.fromEntity(adminContentService.toggleCategoryActive(id));
    return ResponseEntity.ok(response);
  }

  @PutMapping("/reorder")
  @Operation(summary = "Sắp xếp lại thứ tự danh mục")
  public ResponseEntity<Map<String, String>> reorderCategories(
      @RequestParam String type, @Valid @RequestBody CategoryReorderRequest request) {
    adminContentService.reorderCategories(type.toUpperCase(), request.getOrderedIds());
    return ResponseEntity.ok(Map.of("message", "Đã cập nhật thứ tự"));
  }
}

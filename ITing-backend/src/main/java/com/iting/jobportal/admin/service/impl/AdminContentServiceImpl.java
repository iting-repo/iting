package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.request.CategoryRequest;
import com.iting.jobportal.admin.entity.*;
import com.iting.jobportal.admin.repository.*;
import com.iting.jobportal.admin.service.AdminContentService;
import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminContentServiceImpl implements AdminContentService {

  private final CategoryRepository categoryRepository;
  private final StaticContentRepository staticContentRepository;

  // ================================================================
  // CATEGORIES
  // ================================================================

  @Override
  @Transactional(readOnly = true)
  public List<Category> getCategoriesByType(String type) {
    return categoryRepository.findByTypeOrderBySortOrderAsc(type.toUpperCase());
  }

  @Override
  @Transactional(readOnly = true)
  public Map<String, Long> getCategorySummary() {
    Map<String, Long> summary = new LinkedHashMap<>();
    summary.put("SKILL", categoryRepository.countByType("SKILL"));
    summary.put("LOCATION", categoryRepository.countByType("LOCATION"));
    summary.put("INDUSTRY", categoryRepository.countByType("INDUSTRY"));
    summary.put("POSITION", categoryRepository.countByType("POSITION"));
    summary.put("BENEFIT", categoryRepository.countByType("BENEFIT"));
    return summary;
  }

  @Override
  @Transactional(readOnly = true)
  public Category getCategoryById(Long id) {
    return categoryRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
  }

  @Override
  @Transactional
  public Category createCategory(Category category) {
    return categoryRepository.save(category);
  }

  @Override
  @Transactional
  public Category createCategoryFromRequest(String type, CategoryRequest request) {
    String normalizedType = type.toUpperCase();

    // Validate type
    if (!List.of("SKILL", "LOCATION", "INDUSTRY", "POSITION", "BENEFIT").contains(normalizedType)) {
      throw new IllegalArgumentException("Loại danh mục không hợp lệ: " + type);
    }

    // Check duplicate name within the same type
    if (categoryRepository.existsByTypeAndName(normalizedType, request.getName().trim())) {
      throw new IllegalArgumentException(
          "Danh mục '" + request.getName() + "' đã tồn tại trong loại " + normalizedType);
    }

    int nextOrder = categoryRepository.findMaxSortOrderByType(normalizedType) + 1;

    Category category =
        Category.builder()
            .type(normalizedType)
            .name(request.getName().trim())
            .nameEn(request.getNameEn() != null ? request.getNameEn().trim() : null)
            .description(request.getDescription())
            .icon(request.getIcon())
            .parentId(request.getParentId())
            .sortOrder(nextOrder)
            .active(true)
            .build();

    Category saved = categoryRepository.save(category);
    log.info(
        "Created category: type={}, name={}, id={}",
        normalizedType,
        saved.getName(),
        saved.getId());
    return saved;
  }

  @Override
  @Transactional
  public Category updateCategory(Long id, Category category) {
    return categoryRepository.save(category);
  }

  @Override
  @Transactional
  public Category updateCategoryFromRequest(Long id, CategoryRequest request) {
    Category existing =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

    // Check duplicate name within the same type (excluding itself)
    if (categoryRepository.existsByTypeAndNameAndIdNot(
        existing.getType(), request.getName().trim(), id)) {
      throw new IllegalArgumentException(
          "Danh mục '" + request.getName() + "' đã tồn tại trong loại " + existing.getType());
    }

    existing.setName(request.getName().trim());
    existing.setNameEn(request.getNameEn() != null ? request.getNameEn().trim() : null);
    existing.setDescription(request.getDescription());
    existing.setIcon(request.getIcon());
    existing.setParentId(request.getParentId());

    Category updated = categoryRepository.save(existing);
    log.info("Updated category: id={}, name={}", id, updated.getName());
    return updated;
  }

  @Override
  @Transactional
  public void deleteCategory(Long id) {
    if (!categoryRepository.existsById(id)) {
      throw new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id);
    }
    categoryRepository.deleteById(id);
    log.info("Deleted category: id={}", id);
  }

  @Override
  @Transactional
  public Category toggleCategoryActive(Long id) {
    Category category =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

    category.setActive(!Boolean.TRUE.equals(category.getActive()));
    Category saved = categoryRepository.save(category);
    log.info("Toggled category active: id={}, active={}", id, saved.getActive());
    return saved;
  }

  @Override
  @Transactional
  public void reorderCategories(String type, List<Long> orderedIds) {
    String normalizedType = type.toUpperCase();
    List<Category> categories = categoryRepository.findByTypeOrderBySortOrderAsc(normalizedType);

    for (int i = 0; i < orderedIds.size(); i++) {
      final int order = i;
      final Long catId = orderedIds.get(i);
      categories.stream()
          .filter(c -> c.getId().equals(catId))
          .findFirst()
          .ifPresent(c -> c.setSortOrder(order));
    }

    categoryRepository.saveAll(categories);
    log.info("Reordered {} categories of type {}", orderedIds.size(), normalizedType);
  }

  // ================================================================
  // STATIC CONTENTS
  // ================================================================

  @Override
  @Transactional(readOnly = true)
  public Page<StaticContent> getStaticContents(String type, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return staticContentRepository.findAll(pageable);
  }

  @Override
  @Transactional(readOnly = true)
  public StaticContent getStaticContentBySlug(String slug) {
    return staticContentRepository.findBySlug(slug).orElseThrow();
  }

  @Override
  @Transactional
  public StaticContent createStaticContent(StaticContent content) {
    return staticContentRepository.save(content);
  }

  @Override
  @Transactional
  public StaticContent updateStaticContent(Long id, StaticContent content) {
    return staticContentRepository.save(content);
  }

  @Override
  @Transactional
  public void deleteStaticContent(Long id) {
    staticContentRepository.deleteById(id);
  }

  @Override
  public void publishStaticContent(Long id) {}

  @Override
  public void unpublishStaticContent(Long id) {}
}

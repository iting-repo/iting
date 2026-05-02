package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.CategoryRequest;
import com.iting.jobportal.admin.entity.Category;
import com.iting.jobportal.admin.entity.StaticContent;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface AdminContentService {

    List<Category> getCategoriesByType(String type);

    Map<String, Long> getCategorySummary();

    Category getCategoryById(Long id);

    Category createCategory(Category category);

    Category createCategoryFromRequest(String type, CategoryRequest request);

    Category updateCategory(Long id, Category category);

    Category updateCategoryFromRequest(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    Category toggleCategoryActive(Long id);

    void reorderCategories(String type, List<Long> orderedIds);

    Page<StaticContent> getStaticContents(String type, int page, int size);

    StaticContent getStaticContentBySlug(String slug);

    StaticContent createStaticContent(StaticContent content);

    StaticContent updateStaticContent(Long id, StaticContent content);

    void deleteStaticContent(Long id);

    void publishStaticContent(Long id);

    void unpublishStaticContent(Long id);

}

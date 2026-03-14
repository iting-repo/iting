package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.entity.Category;
import com.iting.jobportal.admin.entity.StaticContent;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AdminContentService {

    List<Category> getCategoriesByType(String type);

    Category createCategory(Category category);

    Category updateCategory(Long id, Category category);

    void deleteCategory(Long id);

    Page<StaticContent> getStaticContents(String type, int page, int size);

    StaticContent getStaticContentBySlug(String slug);

    StaticContent createStaticContent(StaticContent content);

    StaticContent updateStaticContent(Long id, StaticContent content);

    void deleteStaticContent(Long id);

    void publishStaticContent(Long id);

    void unpublishStaticContent(Long id);

}
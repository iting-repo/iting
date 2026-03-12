package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.entity.*;
import com.iting.jobportal.admin.repository.*;
import com.iting.jobportal.admin.service.AdminContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminContentServiceImpl implements AdminContentService {

    private final CategoryRepository categoryRepository;
    private final StaticContentRepository staticContentRepository;

    @Override
    public List<Category> getCategoriesByType(String type) {
        return categoryRepository.findByTypeOrderBySortOrderAsc(type);
    }

    @Override
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public Page<StaticContent> getStaticContents(String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return staticContentRepository.findAll(pageable);
    }

    @Override
    public StaticContent getStaticContentBySlug(String slug) {
        return staticContentRepository.findBySlug(slug).orElseThrow();
    }

    @Override
    public StaticContent createStaticContent(StaticContent content) {
        return staticContentRepository.save(content);
    }

    @Override
    public StaticContent updateStaticContent(Long id, StaticContent content) {
        return staticContentRepository.save(content);
    }

    @Override
    public void deleteStaticContent(Long id) {
        staticContentRepository.deleteById(id);
    }

    @Override
    public void publishStaticContent(Long id) {}

    @Override
    public void unpublishStaticContent(Long id) {}
}
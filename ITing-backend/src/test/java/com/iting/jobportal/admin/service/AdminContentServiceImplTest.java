package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.entity.Category;
import com.iting.jobportal.admin.entity.StaticContent;
import com.iting.jobportal.admin.repository.CategoryRepository;
import com.iting.jobportal.admin.repository.StaticContentRepository;
import com.iting.jobportal.admin.service.impl.AdminContentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminContentServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private StaticContentRepository staticContentRepository;

    @InjectMocks
    private AdminContentServiceImpl service;

    @Test
    void getCategoriesByType_shouldReturnOrderedCategoriesFromRepository() {
        List<Category> categories = List.of(new Category(), new Category());
        when(categoryRepository.findByTypeOrderBySortOrderAsc("JOB")).thenReturn(categories);

        List<Category> result = service.getCategoriesByType("job");

        assertSame(categories, result);
        verify(categoryRepository).findByTypeOrderBySortOrderAsc("JOB");
        verifyNoInteractions(staticContentRepository);
    }

    @Test
    void createCategory_shouldPersistAndReturnSavedEntity() {
        Category input = new Category();
        input.setName("IT");

        Category saved = new Category();
        saved.setId(1L);
        saved.setName("IT");

        when(categoryRepository.save(input)).thenReturn(saved);

        Category result = service.createCategory(input);

        assertSame(saved, result);
        verify(categoryRepository).save(input);
        verifyNoInteractions(staticContentRepository);
    }

    @Test
    void updateCategory_shouldSaveProvidedCategoryIgnoringMethodId() {
        Category category = new Category();
        category.setId(100L);
        category.setName("Updated");

        when(categoryRepository.save(category)).thenReturn(category);

        Category result = service.updateCategory(5L, category);

        assertSame(category, result);
        verify(categoryRepository).save(category);
    }

    @Test
    void deleteCategory_shouldCheckExistenceThenDeleteById() {
        when(categoryRepository.existsById(5L)).thenReturn(true);

        service.deleteCategory(5L);

        verify(categoryRepository).existsById(5L);
        verify(categoryRepository).deleteById(5L);
        verifyNoInteractions(staticContentRepository);
    }

    @Test
    void getStaticContents_shouldDelegateToRepositoryWithCorrectPageable() {
        Page<StaticContent> page = new PageImpl<>(List.of(new StaticContent()));
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

        when(staticContentRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<StaticContent> result = service.getStaticContents("about", 1, 5);

        assertSame(page, result);
        verify(staticContentRepository).findAll(pageableCaptor.capture());
        assertEquals(1, pageableCaptor.getValue().getPageNumber());
        assertEquals(5, pageableCaptor.getValue().getPageSize());
    }

    @Test
    void getStaticContents_shouldIgnoreTypeParameterInCurrentImplementation() {
        Page<StaticContent> page = new PageImpl<>(List.of(new StaticContent()));
        when(staticContentRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<StaticContent> result = service.getStaticContents("about", 0, 10);

        assertSame(page, result);
        verify(staticContentRepository).findAll(any(Pageable.class));
        verify(staticContentRepository, never()).findBySlug(any());
    }

    @Test
    void getStaticContentBySlug_shouldReturnMatchingContent() {
        StaticContent content = new StaticContent();
        content.setSlug("about");

        when(staticContentRepository.findBySlug("about")).thenReturn(Optional.of(content));

        StaticContent result = service.getStaticContentBySlug("about");

        assertSame(content, result);
        verify(staticContentRepository).findBySlug("about");
    }

    @Test
    void getStaticContentBySlug_whenNotFound_shouldThrowNoSuchElementException() {
        when(staticContentRepository.findBySlug("missing")).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> service.getStaticContentBySlug("missing"));

        verify(staticContentRepository).findBySlug("missing");
    }

    @Test
    void createStaticContent_shouldPersistAndReturnSavedEntity() {
        StaticContent input = new StaticContent();
        input.setSlug("about");

        StaticContent saved = new StaticContent();
        saved.setId(1L);
        saved.setSlug("about");

        when(staticContentRepository.save(input)).thenReturn(saved);

        StaticContent result = service.createStaticContent(input);

        assertSame(saved, result);
        verify(staticContentRepository).save(input);
    }

    @Test
    void updateStaticContent_shouldSaveProvidedContentIgnoringMethodId() {
        StaticContent content = new StaticContent();
        content.setId(100L);
        content.setSlug("about-us");

        when(staticContentRepository.save(content)).thenReturn(content);

        StaticContent result = service.updateStaticContent(5L, content);

        assertSame(content, result);
        verify(staticContentRepository).save(content);
    }

    @Test
    void deleteStaticContent_shouldDeleteById() {
        service.deleteStaticContent(9L);

        verify(staticContentRepository).deleteById(9L);
    }

    @Test
    void publishStaticContent_shouldDoNothingInCurrentImplementation() {
        service.publishStaticContent(1L);

        verifyNoInteractions(categoryRepository, staticContentRepository);
    }

    @Test
    void unpublishStaticContent_shouldDoNothingInCurrentImplementation() {
        service.unpublishStaticContent(1L);

        verifyNoInteractions(categoryRepository, staticContentRepository);
    }
}

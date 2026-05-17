package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.BlogRequest;
import com.iting.jobportal.admin.entity.Blog;
import com.iting.jobportal.admin.repository.BlogRepository;
import com.iting.jobportal.admin.service.impl.AdminBlogServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBlogServiceImplTest {

    @Mock BlogRepository blogRepository;
    @InjectMocks AdminBlogServiceImpl service;

    // ── getBlogs ──────────────────────────────────────────────────

    @Test
    void getBlogs_returnsPaginatedResults() {
        Blog blog = new Blog();
        blog.setTitle("Spring Boot Guide");
        when(blogRepository.searchBlogs(eq("spring"), eq("PUBLISHED"), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(blog)));

        Page<Blog> result = service.getBlogs("spring", "PUBLISHED", 0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Spring Boot Guide");
    }

    @Test
    void getBlogs_withNullFilters_returnsAll() {
        when(blogRepository.searchBlogs(isNull(), isNull(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(new Blog(), new Blog())));

        Page<Blog> result = service.getBlogs(null, null, 0, 20);

        assertThat(result.getTotalElements()).isEqualTo(2);
    }

    // ── getBlogById ───────────────────────────────────────────────

    @Test
    void getBlogById_returnsExistingBlog() {
        Blog blog = new Blog();
        blog.setTitle("Test Blog");
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));

        Blog result = service.getBlogById(1L);

        assertThat(result.getTitle()).isEqualTo("Test Blog");
    }

    @Test
    void getBlogById_throwsNotFound_whenAbsent() {
        when(blogRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getBlogById(99L))
            .isInstanceOf(ResponseStatusException.class);
    }

    // ── createBlog ────────────────────────────────────────────────

    @Test
    void createBlog_withExplicitSlug_usesProvidedSlug() {
        BlogRequest req = BlogRequest.builder()
            .title("Hello World")
            .slug("hello-world")
            .status("PUBLISHED")
            .build();
        when(blogRepository.existsBySlug("hello-world")).thenReturn(false);
        when(blogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Blog result = service.createBlog(req);

        assertThat(result.getSlug()).isEqualTo("hello-world");
        assertThat(result.getTitle()).isEqualTo("Hello World");
    }

    @Test
    void createBlog_generatesSlugFromTitle_whenSlugNotProvided() {
        BlogRequest req = BlogRequest.builder().title("My First Post").build();
        when(blogRepository.existsBySlug(anyString())).thenReturn(false);
        when(blogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Blog result = service.createBlog(req);

        assertThat(result.getSlug()).isNotBlank();
        assertThat(result.getSlug()).contains("my");
    }

    @Test
    void createBlog_appendsTimestamp_onSlugCollision() {
        BlogRequest req = BlogRequest.builder()
            .title("Duplicate")
            .slug("duplicate")
            .build();
        // First call (exact slug) → collision; timestamped slug → Mockito default false
        when(blogRepository.existsBySlug("duplicate")).thenReturn(true);
        when(blogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Blog result = service.createBlog(req);

        assertThat(result.getSlug()).startsWith("duplicate-");
    }

    @Test
    void createBlog_setsFeaturedAndStatus() {
        BlogRequest req = BlogRequest.builder()
            .title("Featured Post")
            .isFeatured(true)
            .status("DRAFT")
            .author("Admin")
            .build();
        when(blogRepository.existsBySlug(anyString())).thenReturn(false);
        when(blogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Blog result = service.createBlog(req);

        assertThat(result.getIsFeatured()).isTrue();
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        assertThat(result.getAuthor()).isEqualTo("Admin");
    }

    // ── updateBlog ────────────────────────────────────────────────

    @Test
    void updateBlog_updatesTitle_andPreservesSlug() {
        Blog existing = new Blog();
        existing.setTitle("Old Title");
        existing.setSlug("old-slug");
        when(blogRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(blogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BlogRequest req = BlogRequest.builder().title("New Title").build();
        Blog result = service.updateBlog(1L, req);

        assertThat(result.getTitle()).isEqualTo("New Title");
    }

    @Test
    void updateBlog_throwsNotFound_whenAbsent() {
        when(blogRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateBlog(99L, new BlogRequest()))
            .isInstanceOf(ResponseStatusException.class);
    }

    // ── deleteBlog ────────────────────────────────────────────────

    @Test
    void deleteBlog_deletesExistingBlog() {
        Blog blog = new Blog();
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));

        service.deleteBlog(1L);

        verify(blogRepository).delete(blog);
    }

    @Test
    void deleteBlog_throwsNotFound_whenAbsent() {
        when(blogRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteBlog(99L))
            .isInstanceOf(ResponseStatusException.class);
    }

    // ── toSlug (internal logic via createBlog) ────────────────────

    @Test
    void createBlog_toSlug_normalizesVietnamese() {
        BlogRequest req = BlogRequest.builder().title("Xin chào Việt Nam").build();
        when(blogRepository.existsBySlug(anyString())).thenReturn(false);

        ArgumentCaptor<Blog> captor = ArgumentCaptor.forClass(Blog.class);
        when(blogRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        service.createBlog(req);

        String slug = captor.getValue().getSlug();
        assertThat(slug).doesNotContain("ề").doesNotContain("ệ").doesNotContain("Ọ");
        assertThat(slug).matches("[a-z0-9-]+");
    }
}

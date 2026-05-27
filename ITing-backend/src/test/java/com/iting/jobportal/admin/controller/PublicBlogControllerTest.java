package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.entity.Blog;
import com.iting.jobportal.admin.repository.BlogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicBlogControllerTest {

    @Mock private BlogRepository blogRepository;
    @InjectMocks private PublicBlogController controller;

    @Test
    void getBlogs_sortByFeaturedDesc_thenCreatedAtDesc() {
        Page<Blog> page = new PageImpl<>(List.of());
        when(blogRepository.searchBlogs(eq("react"), eq("PUBLISHED"), any(Pageable.class)))
                .thenReturn(page);

        controller.getBlogs("react", 0, 20);

        ArgumentCaptor<Pageable> cap = ArgumentCaptor.forClass(Pageable.class);
        verify(blogRepository).searchBlogs(eq("react"), eq("PUBLISHED"), cap.capture());
        Sort sort = cap.getValue().getSort();
        assertTrue(sort.getOrderFor("isFeatured").isDescending());
        assertTrue(sort.getOrderFor("createdAt").isDescending());
    }

    @Test
    void getBlogs_nullKeyword_passesThrough() {
        when(blogRepository.searchBlogs(eq((String) null), eq("PUBLISHED"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.getBlogs(null, 0, 20);

        verify(blogRepository).searchBlogs(eq((String) null), eq("PUBLISHED"), any(Pageable.class));
    }

    @Test
    void getBlogBySlug_publishedBlog_incrementsViewCount() {
        Blog blog = new Blog();
        blog.setId(1L);
        blog.setSlug("hello");
        blog.setStatus("PUBLISHED");
        blog.setViewCount(10L);
        when(blogRepository.findBySlug("hello")).thenReturn(Optional.of(blog));

        ResponseEntity<Blog> resp = controller.getBlogBySlug("hello");

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        verify(blogRepository).incrementViewCount(1L);
        assertEquals(11L, blog.getViewCount(), "Phản ánh ngay trong response");
    }

    @Test
    void getBlogBySlug_notFound_throws() {
        when(blogRepository.findBySlug("missing")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> controller.getBlogBySlug("missing"));
        verify(blogRepository, never()).incrementViewCount(any());
    }

    @Test
    void getBlogBySlug_draft_throws_noViewIncrement() {
        Blog draft = new Blog();
        draft.setId(1L);
        draft.setStatus("DRAFT");
        when(blogRepository.findBySlug("draft")).thenReturn(Optional.of(draft));

        assertThrows(RuntimeException.class, () -> controller.getBlogBySlug("draft"));
        verify(blogRepository, never()).incrementViewCount(any());
    }

    @Test
    void incrementView_existing_increments() {
        when(blogRepository.existsById(1L)).thenReturn(true);

        ResponseEntity<?> resp = controller.incrementView(1L);

        verify(blogRepository).incrementViewCount(1L);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }

    @Test
    void incrementView_notFound_returns404_noIncrement() {
        when(blogRepository.existsById(99L)).thenReturn(false);

        ResponseEntity<?> resp = controller.incrementView(99L);

        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
        verify(blogRepository, never()).incrementViewCount(any());
    }

    @Test
    void incrementView_returnsMessageBody() {
        when(blogRepository.existsById(1L)).thenReturn(true);
        ResponseEntity<?> resp = controller.incrementView(1L);
        assertSame("View counted",
                ((java.util.Map<?, ?>) resp.getBody()).get("message"));
    }
}

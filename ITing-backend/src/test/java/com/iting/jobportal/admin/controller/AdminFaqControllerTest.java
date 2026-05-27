package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.FaqRequest;
import com.iting.jobportal.admin.entity.StaticContent;
import com.iting.jobportal.admin.repository.StaticContentRepository;
import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests cho AdminFaqController — bao gồm slug resolution rất nontrivial:
 *   - slugify Vietnamese (đ→d, bỏ dấu)
 *   - auto generate từ title nếu user không nhập
 *   - đảm bảo unique bằng cách thêm suffix khi trùng
 *   - cắt khi > 45 ký tự (chừa room cho suffix)
 *   - vẫn keep slug hiện tại khi update (không tự append -1)
 *
 * + CRUD branches: filter combos, type=FAQ filter strict, not-found cases.
 */
@ExtendWith(MockitoExtension.class)
class AdminFaqControllerTest {

    @Mock private StaticContentRepository contentRepository;
    @InjectMocks private AdminFaqController controller;

    // ── list: 4 filter combos ───────────────────────────────────────────

    @Test
    void list_withKeywordAndPublished_callsBothFilters() {
        Page<StaticContent> page = new PageImpl<>(List.of());
        when(contentRepository.findByTypeAndPublishedAndTitleContainingIgnoreCase(
                eq("FAQ"), eq(true), eq("cv"), any(Pageable.class))).thenReturn(page);

        controller.list("cv", true, 0, 50);

        verify(contentRepository).findByTypeAndPublishedAndTitleContainingIgnoreCase(
                eq("FAQ"), eq(true), eq("cv"), any(Pageable.class));
    }

    @Test
    void list_withKeywordOnly_skipsPublishedFilter() {
        when(contentRepository.findByTypeAndTitleContainingIgnoreCase(
                eq("FAQ"), eq("cv"), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        controller.list("cv", null, 0, 50);

        verify(contentRepository).findByTypeAndTitleContainingIgnoreCase(
                eq("FAQ"), eq("cv"), any(Pageable.class));
        verify(contentRepository, never()).findByTypeAndPublishedAndTitleContainingIgnoreCase(
                anyString(), any(), anyString(), any());
    }

    @Test
    void list_withPublishedOnly_filtersByType() {
        when(contentRepository.findByTypeAndPublished(eq("FAQ"), eq(false), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(null, false, 0, 50);

        verify(contentRepository).findByTypeAndPublished(eq("FAQ"), eq(false), any(Pageable.class));
    }

    @Test
    void list_noFilters_returnsAllOfType() {
        when(contentRepository.findByType(eq("FAQ"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list(null, null, 0, 50);

        verify(contentRepository).findByType(eq("FAQ"), any(Pageable.class));
    }

    @Test
    void list_blankKeyword_treatedAsNoKeyword() {
        when(contentRepository.findByType(eq("FAQ"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        controller.list("   ", null, 0, 50);

        verify(contentRepository).findByType(eq("FAQ"), any(Pageable.class));
    }

    // ── getById: type-strict ────────────────────────────────────────────

    @Test
    void getById_typeIsFaq_returnsEntity() {
        StaticContent faq = StaticContent.builder().id(1L).type("FAQ").title("Hello").build();
        when(contentRepository.findById(1L)).thenReturn(Optional.of(faq));

        ResponseEntity<StaticContent> resp = controller.getById(1L);

        assertEquals(faq, resp.getBody());
    }

    @Test
    void getById_typeIsBlog_throws_notFound() {
        // Filter chặt: id hợp lệ nhưng type ≠ FAQ thì controller phải trả 404.
        // Bảo vệ admin khỏi vô tình edit blog post qua endpoint FAQ.
        StaticContent blog = StaticContent.builder().id(1L).type("BLOG").build();
        when(contentRepository.findById(1L)).thenReturn(Optional.of(blog));

        assertThrows(ResourceNotFoundException.class, () -> controller.getById(1L));
    }

    @Test
    void getById_notFound_throws() {
        when(contentRepository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> controller.getById(9L));
    }

    // ── create: slug logic ──────────────────────────────────────────────

    @Test
    void create_withExplicitSlug_normalizes_andSaves() {
        FaqRequest req = new FaqRequest();
        req.setTitle("Tôi có thể đăng ký?");
        req.setContent("<p>Có</p>");
        req.setSlug("custom-slug");
        req.setPublished(true);
        when(contentRepository.existsBySlug("custom-slug")).thenReturn(false);
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.create(req);

        ArgumentCaptor<StaticContent> cap = ArgumentCaptor.forClass(StaticContent.class);
        verify(contentRepository).save(cap.capture());
        StaticContent saved = cap.getValue();
        assertEquals("FAQ", saved.getType());
        assertEquals("custom-slug", saved.getSlug());
        assertEquals("Tôi có thể đăng ký?", saved.getTitle());
        assertEquals("<p>Có</p>", saved.getContent());
        assertTrue(saved.getPublished());
        assertEquals(0L, saved.getViewCount());
        assertEquals(0, saved.getSortOrder());
    }

    @Test
    void create_blankSlug_autoGeneratesFromTitle_vietnameseNormalized() {
        FaqRequest req = new FaqRequest();
        req.setTitle("Đăng ký công ty"); // Có dấu + chữ Đ
        req.setContent("answer");
        req.setSlug(null);
        when(contentRepository.existsBySlug(anyString())).thenReturn(false);
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.create(req);

        ArgumentCaptor<StaticContent> cap = ArgumentCaptor.forClass(StaticContent.class);
        verify(contentRepository).save(cap.capture());
        String slug = cap.getValue().getSlug();
        // Format: "faq-{title slugified}" — đ→d, bỏ dấu, lowercase, space→dash
        assertEquals("faq-dang-ky-cong-ty", slug);
    }

    @Test
    void create_slugConflict_appendsSuffix_untilUnique() {
        FaqRequest req = new FaqRequest();
        req.setTitle("Hi");
        req.setContent("a");
        req.setSlug("hello");
        // hello đã tồn tại; hello-1 cũng đã tồn tại; hello-2 mới trống
        when(contentRepository.existsBySlug("hello")).thenReturn(true);
        when(contentRepository.existsBySlug("hello-1")).thenReturn(true);
        when(contentRepository.existsBySlug("hello-2")).thenReturn(false);
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.create(req);

        ArgumentCaptor<StaticContent> cap = ArgumentCaptor.forClass(StaticContent.class);
        verify(contentRepository).save(cap.capture());
        assertEquals("hello-2", cap.getValue().getSlug());
    }

    @Test
    void create_nullPublished_defaultsFalse() {
        FaqRequest req = new FaqRequest();
        req.setTitle("Q");
        req.setContent("A");
        req.setSlug("q-slug");
        req.setPublished(null);
        req.setSortOrder(null);
        when(contentRepository.existsBySlug(anyString())).thenReturn(false);
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.create(req);

        ArgumentCaptor<StaticContent> cap = ArgumentCaptor.forClass(StaticContent.class);
        verify(contentRepository).save(cap.capture());
        assertFalse(cap.getValue().getPublished(), "published null → default false (draft)");
        assertEquals(0, cap.getValue().getSortOrder(), "sortOrder null → default 0");
    }

    // ── update: keep current slug when matching ─────────────────────────

    @Test
    void update_withSameSlug_keepsIt_noSuffixAppended() {
        StaticContent existing = StaticContent.builder()
                .id(5L).type("FAQ").slug("current-slug").title("Old").content("old").build();
        FaqRequest req = new FaqRequest();
        req.setTitle("New Title");
        req.setContent("new");
        req.setSlug("current-slug"); // giữ nguyên slug cũ
        when(contentRepository.findById(5L)).thenReturn(Optional.of(existing));
        // existsBySlug returns true (vì chính nó), nhưng resolveSlug check "current"
        // → bypass suffix vì slug match
        when(contentRepository.existsBySlug("current-slug")).thenReturn(true);
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.update(5L, req);

        assertEquals("current-slug", existing.getSlug(), "Slug giữ nguyên khi không đổi");
        assertEquals("New Title", existing.getTitle());
        assertEquals("new", existing.getContent());
    }

    @Test
    void update_wrongType_throws() {
        StaticContent blog = StaticContent.builder().id(1L).type("BLOG").build();
        when(contentRepository.findById(1L)).thenReturn(Optional.of(blog));
        FaqRequest req = new FaqRequest();
        req.setTitle("X"); req.setContent("Y");

        assertThrows(ResourceNotFoundException.class, () -> controller.update(1L, req));
    }

    @Test
    void update_notFound_throws() {
        when(contentRepository.findById(99L)).thenReturn(Optional.empty());
        FaqRequest req = new FaqRequest();
        req.setTitle("X"); req.setContent("Y");

        assertThrows(ResourceNotFoundException.class, () -> controller.update(99L, req));
    }

    // ── delete ──────────────────────────────────────────────────────────

    @Test
    void delete_typeIsFaq_succeeds() {
        StaticContent faq = StaticContent.builder().id(3L).type("FAQ").build();
        when(contentRepository.findById(3L)).thenReturn(Optional.of(faq));

        ResponseEntity<?> resp = controller.delete(3L);

        verify(contentRepository).delete(faq);
        assertNotNull(resp.getBody());
        assertEquals("Đã xóa FAQ thành công", ((Map<?, ?>) resp.getBody()).get("message"));
    }

    @Test
    void delete_typeIsBlog_throws_doesNotDelete() {
        StaticContent blog = StaticContent.builder().id(3L).type("BLOG").build();
        when(contentRepository.findById(3L)).thenReturn(Optional.of(blog));

        assertThrows(ResourceNotFoundException.class, () -> controller.delete(3L));
        verify(contentRepository, never()).delete(any(StaticContent.class));
    }

    // ── togglePublished ─────────────────────────────────────────────────

    @Test
    void togglePublished_falseBecomesTrue() {
        StaticContent faq = StaticContent.builder().id(7L).type("FAQ").published(false).build();
        when(contentRepository.findById(7L)).thenReturn(Optional.of(faq));
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.togglePublished(7L);

        assertTrue(faq.getPublished());
    }

    @Test
    void togglePublished_trueBecomesFalse() {
        StaticContent faq = StaticContent.builder().id(7L).type("FAQ").published(true).build();
        when(contentRepository.findById(7L)).thenReturn(Optional.of(faq));
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.togglePublished(7L);

        assertFalse(faq.getPublished());
    }

    @Test
    void togglePublished_nullPublished_treatedAsFalse_becomesTrue() {
        StaticContent faq = StaticContent.builder().id(7L).type("FAQ").published(null).build();
        when(contentRepository.findById(7L)).thenReturn(Optional.of(faq));
        when(contentRepository.save(any(StaticContent.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.togglePublished(7L);

        assertTrue(faq.getPublished(), "null → toggle to true");
    }

    @Test
    void togglePublished_wrongType_throws() {
        StaticContent blog = StaticContent.builder().id(7L).type("BLOG").build();
        when(contentRepository.findById(7L)).thenReturn(Optional.of(blog));
        assertThrows(ResourceNotFoundException.class, () -> controller.togglePublished(7L));
    }
}

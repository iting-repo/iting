package com.iting.jobportal.admin.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminReviewModerationControllerTest {

    @Mock private CompanyReviewRepository reviewRepository;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private HttpServletRequest request;
    @InjectMocks private AdminReviewModerationController controller;

    private CompanyReview review;

    @BeforeEach
    void setup() {
        Company company = new Company();
        company.setId(1L);
        company.setName("Foo Corp");
        Account account = new Account();
        account.setId(10L);
        account.setEmail("u@x.y");

        review = CompanyReview.builder()
                .id(100L)
                .company(company)
                .account(account)
                .title("T")
                .rating(4)
                .content("C")
                .moderationStatus("PENDING")
                .helpfulCount(0)
                .reportCount(0)
                .build();
    }

    // ── list ─────────────────────────────────────────────────────────────

    @Test
    void list_uppercasesStatus_andMapsDto() {
        when(reviewRepository.findByModerationStatusOrderByCreatedAtDesc(eq("PENDING"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(review)));

        ResponseEntity<Page<Map<String, Object>>> resp = controller.list("pending", 0, 20);

        verify(reviewRepository).findByModerationStatusOrderByCreatedAtDesc(eq("PENDING"), any(Pageable.class));
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        Map<String, Object> dto = resp.getBody().getContent().get(0);
        assertEquals(100L, dto.get("id"));
        assertEquals(1L, dto.get("companyId"));
        assertEquals("Foo Corp", dto.get("companyName"));
        assertEquals("u@x.y", dto.get("authorEmail"));
        assertEquals("PENDING", dto.get("moderationStatus"));
    }

    @Test
    void list_orphanReview_noCompanyNoAccount_dtoHasNulls() {
        review.setCompany(null);
        review.setAccount(null);
        when(reviewRepository.findByModerationStatusOrderByCreatedAtDesc(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(review)));

        ResponseEntity<Page<Map<String, Object>>> resp = controller.list("PENDING", 0, 20);

        Map<String, Object> dto = resp.getBody().getContent().get(0);
        assertNull(dto.get("companyId"));
        assertNull(dto.get("companyName"));
        assertNull(dto.get("authorEmail"));
    }

    // ── counts ───────────────────────────────────────────────────────────

    @Test
    void counts_returnsAllThreeStatuses() {
        when(reviewRepository.countByModerationStatus("PENDING")).thenReturn(5L);
        when(reviewRepository.countByModerationStatus("APPROVED")).thenReturn(100L);
        when(reviewRepository.countByModerationStatus("REJECTED")).thenReturn(2L);

        ResponseEntity<Map<String, Long>> resp = controller.counts();

        assertEquals(5L, resp.getBody().get("PENDING"));
        assertEquals(100L, resp.getBody().get("APPROVED"));
        assertEquals(2L, resp.getBody().get("REJECTED"));
    }

    // ── approve ──────────────────────────────────────────────────────────

    @Test
    void approve_setsStatusAndClearsNote() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));
        review.setModeratorNote("previous reject reason");

        ResponseEntity<Map<String, String>> resp = controller.approve(100L, request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("APPROVED", review.getModerationStatus());
        assertEquals(99L, review.getModeratedBy());
        assertNotNull(review.getModeratedAt());
        assertNull(review.getModeratorNote(), "Approve phải clear note cũ");
        verify(reviewRepository).save(review);
        assertEquals("Đã duyệt review #100", resp.getBody().get("message"));
    }

    @Test
    void approve_notFound_throws404_noSave() {
        when(reviewRepository.findById(100L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.approve(100L, request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(reviewRepository, never()).save(any(CompanyReview.class));
    }

    // ── reject ───────────────────────────────────────────────────────────

    @Test
    void reject_setsStatusAndStoresNote() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));

        ResponseEntity<Map<String, String>> resp = controller.reject(100L, "Spam content", request);

        assertEquals("REJECTED", review.getModerationStatus());
        assertEquals("Spam content", review.getModeratorNote());
        assertEquals(99L, review.getModeratedBy());
        assertEquals("Đã từ chối review #100", resp.getBody().get("message"));
    }

    @Test
    void reject_nullNote_accepted() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review));

        controller.reject(100L, null, request);

        assertEquals("REJECTED", review.getModerationStatus());
        assertNull(review.getModeratorNote());
    }

    @Test
    void reject_notFound_throws404() {
        when(reviewRepository.findById(100L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.reject(100L, "spam", request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(reviewRepository, never()).save(any(CompanyReview.class));
    }
}

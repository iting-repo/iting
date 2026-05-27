package com.iting.jobportal.company.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import com.iting.jobportal.company.repository.CompanyReviewVoteRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests cho luồng DELETE /api/reviews/{id} sau v109:
 *  - Author tự xóa review của mình → 200, vote + review bị xóa
 *  - Admin xóa review của user khác → 200 (moderation power)
 *  - User khác (không phải author/admin) → 403
 *  - Review không tồn tại → 404
 *  - Chưa đăng nhập → 401
 */
@ExtendWith(MockitoExtension.class)
class CompanyReviewControllerDeleteTest {

    @Mock private CompanyReviewRepository reviewRepository;
    @Mock private CompanyReviewVoteRepository voteRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private HttpServletRequest request;

    @InjectMocks private CompanyReviewController controller;

    private Account author;
    private Account admin;
    private Account stranger;
    private CompanyReview review;

    @BeforeEach
    void setup() {
        author = new Account();
        author.setId(10L);
        author.setRole(Role.CANDIDATE);

        admin = new Account();
        admin.setId(1L);
        admin.setRole(Role.ADMIN);

        stranger = new Account();
        stranger.setId(99L);
        stranger.setRole(Role.CANDIDATE);

        review = CompanyReview.builder()
                .id(500L)
                .account(author)
                .rating(5)
                .content("OK")
                .build();
    }

    @Test
    void delete_byAuthor_succeeds_andDeletesVotesAndReview() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(review));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(author));

        ResponseEntity<Map<String, String>> resp = controller.deleteReview(500L, request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals("Đã xóa đánh giá thành công.", resp.getBody().get("message"));
        verify(voteRepository).deleteAllByReviewId(500L);
        verify(reviewRepository).delete(review);
    }

    @Test
    void delete_byAdmin_notAuthor_succeeds() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(review));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(admin));

        ResponseEntity<Map<String, String>> resp = controller.deleteReview(500L, request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        verify(voteRepository).deleteAllByReviewId(500L);
        verify(reviewRepository).delete(review);
    }

    @Test
    void delete_byStranger_throws403_andNothingDeleted() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(review));
        when(accountRepository.findById(99L)).thenReturn(Optional.of(stranger));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteReview(500L, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());

        verify(voteRepository, never()).deleteAllByReviewId(anyLong());
        verify(reviewRepository, never()).delete(any(CompanyReview.class));
    }

    @Test
    void delete_reviewNotFound_throws404() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
        when(reviewRepository.findById(500L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteReview(500L, request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void delete_unauthenticated_throws401() {
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteReview(500L, request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void delete_orphanReview_noAccount_andNonAdmin_throws403() {
        // Edge case: review có account=null (data corruption). Author check fails;
        // chỉ admin được xóa loại này.
        review.setAccount(null);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(99L);
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(review));
        when(accountRepository.findById(99L)).thenReturn(Optional.of(stranger));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.deleteReview(500L, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void delete_orphanReview_byAdmin_succeeds() {
        review.setAccount(null);
        when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(1L);
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(review));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(admin));

        ResponseEntity<Map<String, String>> resp = controller.deleteReview(500L, request);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        verify(reviewRepository).delete(review);
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private static long anyLong() { return org.mockito.ArgumentMatchers.anyLong(); }
    private static <T> T any(Class<T> c) { return org.mockito.ArgumentMatchers.any(c); }
}

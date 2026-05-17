package com.iting.jobportal.company.service;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import com.iting.jobportal.company.service.impl.CompanyReviewServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyReviewServiceImplTest {

    @Mock private CompanyReviewRepository reviewRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private AccountRepository accountRepository;
    @InjectMocks private CompanyReviewServiceImpl service;

    // ── createReview ──────────────────────────────────────────────

    @Test
    void createReview_savesWithCorrectFields() {
        Company company = new Company();
        company.setId(1L);
        Account account = new Account();
        account.setId(2L);

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(account));
        when(reviewRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CompanyReview result = service.createReview(1L, 2L, 4, "Great company");

        assertEquals(company, result.getCompany());
        assertEquals(account, result.getAccount());
        assertEquals(4, result.getRating());
        assertEquals("Great company", result.getContent());
        verify(reviewRepository).save(any());
    }

    @Test
    void createReview_whenCompanyNotFound_throws() {
        when(companyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.createReview(99L, 1L, 3, "ok"));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReview_whenAccountNotFound_throws() {
        when(companyRepository.findById(1L)).thenReturn(Optional.of(new Company()));
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.createReview(1L, 99L, 3, "ok"));
        verify(reviewRepository, never()).save(any());
    }

    // ── getCompanyReviews ─────────────────────────────────────────

    @Test
    void getCompanyReviews_returnsOrderedListFromRepository() {
        CompanyReview r1 = new CompanyReview();
        CompanyReview r2 = new CompanyReview();
        when(reviewRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(r1, r2));

        List<CompanyReview> result = service.getCompanyReviews(1L);

        assertEquals(2, result.size());
        assertSame(r1, result.get(0));
    }

    @Test
    void getCompanyReviews_whenNoReviews_returnsEmptyList() {
        when(reviewRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        List<CompanyReview> result = service.getCompanyReviews(1L);

        assertTrue(result.isEmpty());
    }

    // ── getCompanyRatingStats ─────────────────────────────────────

    @Test
    void getCompanyRatingStats_returnsMapWithAverageAndCount() {
        when(reviewRepository.getAverageRating(1L)).thenReturn(4.2);
        when(reviewRepository.countByCompanyId(1L)).thenReturn(10L);

        Map<String, Object> stats = service.getCompanyRatingStats(1L);

        assertNotNull(stats);
        assertEquals(4.2, stats.get("averageRating"));
        assertEquals(10L, stats.get("reviewCount"));
    }

    @Test
    void getCompanyRatingStats_whenNoReviews_averageRatingIsZero() {
        when(reviewRepository.getAverageRating(1L)).thenReturn(null);
        when(reviewRepository.countByCompanyId(1L)).thenReturn(0L);

        Map<String, Object> stats = service.getCompanyRatingStats(1L);

        // Impl coalesces null → 0.0 for UI display.
        assertEquals(0.0, stats.get("averageRating"));
        assertEquals(0L, stats.get("reviewCount"));
    }
}

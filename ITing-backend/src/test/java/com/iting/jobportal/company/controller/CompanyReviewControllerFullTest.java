package com.iting.jobportal.company.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.entity.CompanyReviewVote;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import com.iting.jobportal.company.repository.CompanyReviewVoteRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

/**
 * Bao phủ các endpoint còn lại của CompanyReviewController ngoài deleteReview (đã có ở
 * CompanyReviewControllerDeleteTest): - ratingStats - listReviews - submitReview - toggleHelpful -
 * reportReview
 */
@ExtendWith(MockitoExtension.class)
class CompanyReviewControllerFullTest {

  @Mock private CompanyReviewRepository reviewRepository;
  @Mock private CompanyReviewVoteRepository voteRepository;
  @Mock private CompanyRepository companyRepository;
  @Mock private AccountRepository accountRepository;
  @Mock private JwtTokenUtil jwtTokenUtil;
  @Mock private HttpServletRequest request;

  @InjectMocks private CompanyReviewController controller;

  private Company company;
  private Account user;

  @BeforeEach
  void setup() {
    company = new Company();
    company.setId(1L);
    company.setName("ACME");

    user = new Account();
    user.setId(10L);
    user.setRole(Role.CANDIDATE);
    user.setFullName("U Name");
  }

  private CompanyReview makeReview(int rating, boolean recommend, String status) {
    return CompanyReview.builder()
        .id(100L)
        .company(company)
        .account(user)
        .rating(rating)
        .wouldRecommend(recommend)
        .moderationStatus(status)
        .helpfulCount(0)
        .reportCount(0)
        .build();
  }

  // ── ratingStats ─────────────────────────────────────────────────────

  @Test
  void ratingStats_aggregatesApprovedReviews() {
    List<CompanyReview> all =
        List.of(
            makeReview(5, true, "APPROVED"),
            makeReview(4, true, "APPROVED"),
            makeReview(3, false, "APPROVED"),
            makeReview(2, false, "PENDING") // filtered out
            );
    when(reviewRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(all);

    ResponseEntity<Map<String, Object>> resp = controller.ratingStats(1L);

    Map<String, Object> body = resp.getBody();
    assertNotNull(body);
    assertEquals(4.0, body.get("averageRating"), "Avg = (5+4+3)/3 = 4.0");
    assertEquals(3, body.get("reviewCount"));
    assertEquals(67L, body.get("recommendPercent"), "2/3 recommends = 66.67 rounded to 67");
    @SuppressWarnings("unchecked")
    Map<Integer, Long> dist = (Map<Integer, Long>) body.get("ratingDistribution");
    assertEquals(1L, dist.get(5));
    assertEquals(1L, dist.get(4));
    assertEquals(1L, dist.get(3));
    assertEquals(0L, dist.get(2));
    assertEquals(0L, dist.get(1));
  }

  @Test
  void ratingStats_noApproved_zeroPercent() {
    when(reviewRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

    Map<String, Object> body = controller.ratingStats(1L).getBody();

    assertEquals(0.0, body.get("averageRating"));
    assertEquals(0, body.get("reviewCount"));
    assertEquals(0L, body.get("recommendPercent"));
  }

  // ── listReviews ─────────────────────────────────────────────────────

  @Test
  void listReviews_filtersApproved_andMapsRealName() {
    // Toggle isAnonymous false: per v109 controller now ALWAYS shows real name
    CompanyReview r = makeReview(5, true, "APPROVED");
    r.setIsAnonymous(false);
    when(reviewRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(r));

    ResponseEntity<Map<String, Object>> resp = controller.listReviews(1L);

    Map<String, Object> body = resp.getBody();
    assertEquals(1, body.get("totalReviews"));
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> reviews = (List<Map<String, Object>>) body.get("reviews");
    assertEquals("U Name", reviews.get(0).get("authorName"));
    assertEquals(10L, reviews.get(0).get("accountId"));
  }

  @Test
  void listReviews_orphanReview_noAccount_returnsAnonymousFallback() {
    CompanyReview orphan = makeReview(5, true, "APPROVED");
    orphan.setAccount(null);
    when(reviewRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(orphan));

    @SuppressWarnings("unchecked")
    List<Map<String, Object>> reviews =
        (List<Map<String, Object>>) controller.listReviews(1L).getBody().get("reviews");

    assertEquals("Người dùng ẩn danh", reviews.get(0).get("authorName"));
  }

  // ── submitReview ────────────────────────────────────────────────────

  @Test
  void submitReview_validInput_savesAsPending() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
    when(accountRepository.findById(10L)).thenReturn(Optional.of(user));
    when(reviewRepository.save(any(CompanyReview.class)))
        .thenAnswer(
            inv -> {
              CompanyReview r = inv.getArgument(0);
              r.setId(999L);
              return r;
            });

    Map<String, Object> body =
        Map.ofEntries(
            Map.entry("rating", 5),
            Map.entry("title", "Great workplace"),
            Map.entry("content", "Loved it"),
            Map.entry("pros", "Good salary"),
            Map.entry("cons", "Long hours"),
            Map.entry("workType", "CURRENT_EMPLOYEE"),
            Map.entry("jobTitle", "Engineer"),
            Map.entry("workYears", 3),
            Map.entry("salaryRangeMin", 1000),
            Map.entry("salaryRangeMax", 5000),
            Map.entry("wouldRecommend", true),
            Map.entry("cultureRating", 5));

    ResponseEntity<Map<String, Object>> resp = controller.submitReview(1L, body, request);

    ArgumentCaptor<CompanyReview> cap = ArgumentCaptor.forClass(CompanyReview.class);
    verify(reviewRepository).save(cap.capture());
    CompanyReview saved = cap.getValue();
    assertEquals(5, saved.getRating());
    assertEquals("Great workplace", saved.getTitle());
    assertEquals("PENDING", saved.getModerationStatus());
    assertEquals(0, saved.getHelpfulCount());
    assertEquals(0, saved.getReportCount());
    assertTrue(saved.getWouldRecommend());
    assertEquals(new BigDecimal("1000"), saved.getSalaryRangeMin());
    assertEquals("PENDING", resp.getBody().get("status"));
    assertEquals(999L, resp.getBody().get("id"));
  }

  @Test
  void submitReview_defaults_ratingFiveIfMissing_workTypeFormerIfMissing() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
    when(accountRepository.findById(10L)).thenReturn(Optional.of(user));
    when(reviewRepository.save(any(CompanyReview.class)))
        .thenAnswer(
            inv -> {
              CompanyReview r = inv.getArgument(0);
              r.setId(999L); // Map.of trong controller requires non-null id
              return r;
            });

    controller.submitReview(1L, Map.of("title", "X"), request);

    ArgumentCaptor<CompanyReview> cap = ArgumentCaptor.forClass(CompanyReview.class);
    verify(reviewRepository).save(cap.capture());
    assertEquals(5, cap.getValue().getRating(), "default rating = 5");
    assertEquals("FORMER_EMPLOYEE", cap.getValue().getWorkType(), "default workType");
  }

  @Test
  void submitReview_companyNotFound_throws404() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(companyRepository.findById(1L)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> controller.submitReview(1L, Map.of(), request));
    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  void submitReview_accountNotFound_throws404() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
    when(accountRepository.findById(10L)).thenReturn(Optional.empty());

    assertThrows(
        ResponseStatusException.class, () -> controller.submitReview(1L, Map.of(), request));
  }

  @Test
  void submitReview_unauth_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class, () -> controller.submitReview(1L, Map.of(), request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  // ── toggleHelpful ───────────────────────────────────────────────────

  @Test
  void toggleHelpful_noExistingVote_addsVote_incrementsCount() {
    CompanyReview r = makeReview(5, true, "APPROVED");
    r.setHelpfulCount(3);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.of(r));
    when(voteRepository.findByReviewIdAndAccountId(100L, 10L)).thenReturn(Optional.empty());

    ResponseEntity<Map<String, Object>> resp = controller.toggleHelpful(100L, request);

    assertEquals(true, resp.getBody().get("helpful"));
    assertEquals(4, resp.getBody().get("helpfulCount"));
    verify(voteRepository).save(any(CompanyReviewVote.class));
  }

  @Test
  void toggleHelpful_existingVote_removesVote_decrementsCount() {
    CompanyReview r = makeReview(5, true, "APPROVED");
    r.setHelpfulCount(5);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.of(r));
    CompanyReviewVote existing = CompanyReviewVote.builder().reviewId(100L).accountId(10L).build();
    when(voteRepository.findByReviewIdAndAccountId(100L, 10L)).thenReturn(Optional.of(existing));

    ResponseEntity<Map<String, Object>> resp = controller.toggleHelpful(100L, request);

    assertEquals(false, resp.getBody().get("helpful"));
    assertEquals(4, resp.getBody().get("helpfulCount"));
    verify(voteRepository).delete(existing);
  }

  @Test
  void toggleHelpful_existingVote_countAtZero_clampsToZero() {
    // Edge: count somehow already at 0 → don't go negative
    CompanyReview r = makeReview(5, true, "APPROVED");
    r.setHelpfulCount(0);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.of(r));
    CompanyReviewVote existing = CompanyReviewVote.builder().reviewId(100L).accountId(10L).build();
    when(voteRepository.findByReviewIdAndAccountId(100L, 10L)).thenReturn(Optional.of(existing));

    controller.toggleHelpful(100L, request);

    assertEquals(0, r.getHelpfulCount(), "Math.max(0, …) keeps non-negative");
  }

  @Test
  void toggleHelpful_notFound_throws404() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.toggleHelpful(100L, request));
    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  void toggleHelpful_unauth_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.toggleHelpful(100L, request));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
  }

  // ── reportReview ────────────────────────────────────────────────────

  @Test
  void reportReview_incrementsCount() {
    CompanyReview r = makeReview(5, true, "APPROVED");
    r.setReportCount(2);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.of(r));

    controller.reportReview(100L, request);

    assertEquals(3, r.getReportCount());
    assertEquals("APPROVED", r.getModerationStatus(), "Below 5 reports — still APPROVED");
  }

  @Test
  void reportReview_atFiveReports_movesApprovedToPending() {
    CompanyReview r = makeReview(5, true, "APPROVED");
    r.setReportCount(4);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.of(r));

    controller.reportReview(100L, request);

    assertEquals(5, r.getReportCount());
    assertEquals(
        "PENDING",
        r.getModerationStatus(),
        "5+ reports + already APPROVED → auto re-PENDING for re-moderation");
  }

  @Test
  void reportReview_pendingReview_stillIncrement_butStatusUnchanged() {
    // Already PENDING — don't bounce around statuses
    CompanyReview r = makeReview(5, true, "PENDING");
    r.setReportCount(10);
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.of(r));

    controller.reportReview(100L, request);

    assertEquals(11, r.getReportCount());
    assertEquals("PENDING", r.getModerationStatus());
  }

  @Test
  void reportReview_notFound_throws404() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(10L);
    when(reviewRepository.findById(100L)).thenReturn(Optional.empty());

    ResponseStatusException ex =
        assertThrows(ResponseStatusException.class, () -> controller.reportReview(100L, request));
    assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
  }

  @Test
  void reportReview_unauth_throws401() {
    when(jwtTokenUtil.getUserIdFromHeader(request)).thenReturn(null);
    assertThrows(ResponseStatusException.class, () -> controller.reportReview(100L, request));
  }
}

package com.iting.jobportal.company.controller;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.entity.CompanyReviewVote;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import com.iting.jobportal.company.repository.CompanyReviewVoteRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * V2 Glassdoor-style reviews — anonymous by default, moderated, helpful-votes.
 *
 * <p>New endpoints (don't collide with the V1 {@code /api/public/companies/{id}/reviews}):
 * <ul>
 *   <li>GET  /api/public/companies/{id}/reviews-v2     — list APPROVED only + summary</li>
 *   <li>POST /api/companies/{id}/reviews-v2            — submit (status=PENDING)</li>
 *   <li>POST /api/reviews/{id}/helpful                 — toggle helpful vote</li>
 *   <li>POST /api/reviews/{id}/report                  — flag for moderation</li>
 * </ul>
 */
@RestController
@RequiredArgsConstructor
public class CompanyReviewV2Controller {

    private final CompanyReviewRepository reviewRepository;
    private final CompanyReviewVoteRepository voteRepository;
    private final CompanyRepository companyRepository;
    private final AccountRepository accountRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @GetMapping("/api/public/companies/{companyId}/reviews-v2")
    public ResponseEntity<Map<String, Object>> listReviews(@PathVariable Long companyId) {
        List<CompanyReview> all = reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        List<CompanyReview> approved = all.stream()
                .filter(r -> "APPROVED".equals(r.getModerationStatus()))
                .collect(Collectors.toList());

        double avgOverall = approved.stream().mapToInt(CompanyReview::getRating).average().orElse(0);
        long recommendCount = approved.stream().filter(r -> Boolean.TRUE.equals(r.getWouldRecommend())).count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalReviews", approved.size());
        response.put("averageRating", Math.round(avgOverall * 10) / 10.0);
        response.put("recommendPercent", approved.isEmpty() ? 0
                : Math.round(recommendCount * 100.0 / approved.size()));
        response.put("reviews", approved.stream().map(this::toPublicDto).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/companies/{companyId}/reviews-v2")
    public ResponseEntity<Map<String, Object>> submitReview(
            @PathVariable Long companyId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        Long userId = requireUser(request);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Công ty không tồn tại"));
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account không tồn tại"));

        CompanyReview review = CompanyReview.builder()
                .company(company)
                .account(account)
                .rating(asInt(body.get("rating"), 5))
                .title(asString(body.get("title"), null))
                .content(asString(body.get("content"), null))
                .pros(asString(body.get("pros"), null))
                .cons(asString(body.get("cons"), null))
                .workType(asString(body.get("workType"), "FORMER_EMPLOYEE"))
                .jobTitle(asString(body.get("jobTitle"), null))
                .workYears(asInt(body.get("workYears"), null))
                .salaryRangeMin(asBigDecimal(body.get("salaryRangeMin")))
                .salaryRangeMax(asBigDecimal(body.get("salaryRangeMax")))
                .wouldRecommend(Boolean.TRUE.equals(body.get("wouldRecommend")))
                .cultureRating(asInt(body.get("cultureRating"), null))
                .workLifeBalanceRating(asInt(body.get("workLifeBalanceRating"), null))
                .careerGrowthRating(asInt(body.get("careerGrowthRating"), null))
                .salaryBenefitsRating(asInt(body.get("salaryBenefitsRating"), null))
                .managementRating(asInt(body.get("managementRating"), null))
                .isAnonymous(!Boolean.FALSE.equals(body.get("isAnonymous")))
                .moderationStatus("PENDING")
                .helpfulCount(0)
                .reportCount(0)
                .build();
        review = reviewRepository.save(review);

        return ResponseEntity.ok(Map.of(
                "id", review.getId(),
                "status", review.getModerationStatus(),
                "message", "Đánh giá đã được gửi và đang chờ admin duyệt."
        ));
    }

    @PostMapping("/api/reviews/{reviewId}/helpful")
    public ResponseEntity<Map<String, Object>> toggleHelpful(
            @PathVariable Long reviewId, HttpServletRequest request) {

        Long userId = requireUser(request);
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review không tồn tại"));

        var existingVote = voteRepository.findByReviewIdAndAccountId(reviewId, userId);
        boolean nowHelpful;
        if (existingVote.isPresent()) {
            voteRepository.delete(existingVote.get());
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
            nowHelpful = false;
        } else {
            voteRepository.save(CompanyReviewVote.builder()
                    .reviewId(reviewId).accountId(userId).build());
            review.setHelpfulCount(review.getHelpfulCount() + 1);
            nowHelpful = true;
        }
        reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("helpful", nowHelpful, "helpfulCount", review.getHelpfulCount()));
    }

    @PostMapping("/api/reviews/{reviewId}/report")
    public ResponseEntity<Map<String, String>> reportReview(
            @PathVariable Long reviewId, HttpServletRequest request) {
        requireUser(request);
        CompanyReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review không tồn tại"));
        review.setReportCount(review.getReportCount() + 1);
        if (review.getReportCount() >= 5 && "APPROVED".equals(review.getModerationStatus())) {
            review.setModerationStatus("PENDING");
        }
        reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("message", "Cảm ơn bạn đã báo cáo."));
    }

    private Map<String, Object> toPublicDto(CompanyReview r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("title", r.getTitle());
        m.put("rating", r.getRating());
        m.put("content", r.getContent());
        m.put("pros", r.getPros());
        m.put("cons", r.getCons());
        m.put("workType", r.getWorkType());
        m.put("jobTitle", r.getJobTitle());
        m.put("workYears", r.getWorkYears());
        m.put("wouldRecommend", r.getWouldRecommend());
        m.put("cultureRating", r.getCultureRating());
        m.put("workLifeBalanceRating", r.getWorkLifeBalanceRating());
        m.put("careerGrowthRating", r.getCareerGrowthRating());
        m.put("salaryBenefitsRating", r.getSalaryBenefitsRating());
        m.put("managementRating", r.getManagementRating());
        m.put("helpfulCount", r.getHelpfulCount());
        m.put("createdAt", r.getCreatedAt());
        if (Boolean.FALSE.equals(r.getIsAnonymous()) && r.getAccount() != null) {
            m.put("authorName", r.getAccount().getFullName());
        } else {
            m.put("authorName", "Người dùng ẩn danh");
        }
        return m;
    }

    private Long requireUser(HttpServletRequest request) {
        Long id = jwtTokenUtil.getUserIdFromHeader(request);
        if (id == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        return id;
    }

    private String asString(Object o, String def) {
        if (o == null) return def;
        String s = o.toString().trim();
        return s.isEmpty() ? def : s;
    }
    private Integer asInt(Object o, Integer def) {
        if (o == null) return def;
        try { return Integer.parseInt(o.toString()); } catch (Exception e) { return def; }
    }
    private BigDecimal asBigDecimal(Object o) {
        if (o == null) return null;
        try { return new BigDecimal(o.toString()); } catch (Exception e) { return null; }
    }
}

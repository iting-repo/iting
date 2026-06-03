package com.iting.jobportal.company.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.dto.request.UpdateCompanyReviewRequest;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import com.iting.jobportal.company.service.CompanyReviewService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyReviewServiceImpl implements CompanyReviewService {

  private final CompanyReviewRepository reviewRepository;
  private final CompanyRepository companyRepository;
  private final AccountRepository accountRepository;

  @Override
  @Transactional
  public CompanyReview createReview(Long companyId, Long accountId, int rating, String content) {
    Company company =
        companyRepository
            .findById(companyId)
            .orElseThrow(() -> new RuntimeException("Company not found"));
    Account account =
        accountRepository
            .findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));

    // Candidate endpoint không qua moderation — auto-approve để hiển thị ngay.
    // Endpoint full /api/companies/{id}/reviews vẫn giữ PENDING cho moderation flow.
    CompanyReview review =
        CompanyReview.builder()
            .company(company)
            .account(account)
            .rating(rating)
            .content(content)
            .moderationStatus("APPROVED")
            .build();

    return reviewRepository.save(review);
  }

  @Override
  public List<CompanyReview> getCompanyReviews(Long companyId) {
    return reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
  }

  @Override
  public Map<String, Object> getCompanyRatingStats(Long companyId) {
    Double avg = reviewRepository.getAverageRating(companyId);
    long count = reviewRepository.countByCompanyId(companyId);

    return Map.of("averageRating", avg != null ? avg : 0.0, "reviewCount", count);
  }

  @Override
  @Transactional
  public CompanyReview updateReview(
      Long reviewId, Long accountId, UpdateCompanyReviewRequest request) {
    CompanyReview review =
        reviewRepository
            .findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy review"));

    // Auth check: chỉ author mới được sửa.
    if (review.getAccount() == null || !review.getAccount().getId().equals(accountId)) {
      throw new RuntimeException("Chỉ tác giả mới được sửa review");
    }

    // Status gate: chặn sửa sau khi APPROVED/REJECTED — content đã được moderator duyệt
    // / hiển thị public, sửa lén làm sai context. NEEDS_RESUBMISSION cho phép vì user
    // bị yêu cầu sửa lại theo feedback của moderator.
    String currentStatus = review.getModerationStatus();
    if (currentStatus != null
        && !"PENDING".equalsIgnoreCase(currentStatus)
        && !"DRAFT".equalsIgnoreCase(currentStatus)
        && !"NEEDS_RESUBMISSION".equalsIgnoreCase(currentStatus)
        && !"PENDING_REVIEW".equalsIgnoreCase(currentStatus)) {
      throw new RuntimeException(
          "Review đã được duyệt (" + currentStatus + "), không thể sửa. Vui lòng liên hệ admin.");
    }

    // Apply chỉ field non-null — partial update kiểu PATCH semantics.
    if (request.getRating() != null) review.setRating(request.getRating());
    if (request.getTitle() != null) review.setTitle(request.getTitle());
    if (request.getContent() != null) review.setContent(request.getContent());
    if (request.getPros() != null) review.setPros(request.getPros());
    if (request.getCons() != null) review.setCons(request.getCons());
    if (request.getCultureRating() != null) review.setCultureRating(request.getCultureRating());
    if (request.getWorkLifeBalanceRating() != null)
      review.setWorkLifeBalanceRating(request.getWorkLifeBalanceRating());
    if (request.getCareerGrowthRating() != null)
      review.setCareerGrowthRating(request.getCareerGrowthRating());
    if (request.getSalaryBenefitsRating() != null)
      review.setSalaryBenefitsRating(request.getSalaryBenefitsRating());
    if (request.getManagementRating() != null)
      review.setManagementRating(request.getManagementRating());
    if (request.getWouldRecommend() != null) review.setWouldRecommend(request.getWouldRecommend());

    // Reset về PENDING để moderator review lại bản sửa.
    review.setModerationStatus("PENDING");

    return reviewRepository.save(review);
  }
}

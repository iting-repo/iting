package com.iting.jobportal.company.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyReview;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.CompanyReviewRepository;
import com.iting.jobportal.company.service.CompanyReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CompanyReviewServiceImpl implements CompanyReviewService {

    private final CompanyReviewRepository reviewRepository;
    private final CompanyRepository companyRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public CompanyReview createReview(Long companyId, Long accountId, int rating, String content) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        CompanyReview review = CompanyReview.builder()
                .company(company)
                .account(account)
                .rating(rating)
                .content(content)
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

        return Map.of(
                "averageRating", avg != null ? avg : 0.0,
                "reviewCount", count);
    }
}

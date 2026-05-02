package com.iting.jobportal.company.service;

import com.iting.jobportal.company.entity.CompanyReview;
import java.util.List;
import java.util.Map;

public interface CompanyReviewService {
    CompanyReview createReview(Long companyId, Long accountId, int rating, String content);

    List<CompanyReview> getCompanyReviews(Long companyId);

    Map<String, Object> getCompanyRatingStats(Long companyId);
}

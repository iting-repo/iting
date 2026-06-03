package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.request.UpdateCompanyReviewRequest;
import com.iting.jobportal.company.entity.CompanyReview;
import java.util.List;
import java.util.Map;

public interface CompanyReviewService {
  CompanyReview createReview(Long companyId, Long accountId, int rating, String content);

  List<CompanyReview> getCompanyReviews(Long companyId);

  Map<String, Object> getCompanyRatingStats(Long companyId);

  /**
   * Update review của chính author. Chỉ cho phép khi moderationStatus IN
   * (PENDING, NEEDS_RESUBMISSION) — không sửa được sau khi APPROVED/REJECTED.
   * Sau update, status reset về PENDING để moderator review lại.
   *
   * @param reviewId id review
   * @param accountId account đang request — phải trùng author
   * @param request fields cần update (null = giữ nguyên)
   */
  CompanyReview updateReview(Long reviewId, Long accountId, UpdateCompanyReviewRequest request);
}

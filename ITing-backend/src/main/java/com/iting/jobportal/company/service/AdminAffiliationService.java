package com.iting.jobportal.company.service;

import com.iting.jobportal.company.dto.response.AdminAffiliationResponse;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Admin-side service cho affiliation review.
 *   * approve: duyệt submission. Auto-apply snapshot lên Company nếu là affiliation đầu tiên
 *              APPROVED của Company.
 *   * reject: từ chối submission. Nếu lần đầu (PENDING) → membership cũng REJECTED.
 *   * applyToCompany: áp snapshot lên Company (luồng tổng đài).
 *   * revoke: thu hồi membership sau khi đã APPROVED.
 */
public interface AdminAffiliationService {

    Page<AdminAffiliationResponse> list(AffiliationStatus status,
                                        SubmissionStatus submissionStatus,
                                        Long companyId,
                                        Long hrAccountId,
                                        String hrEmail,
                                        Pageable pageable);

    AdminAffiliationResponse getDetail(Long affiliationId);

    String getLicensePresignedUrl(Long affiliationId, int expiryMinutes);

    String getLogoPresignedUrl(Long affiliationId, int expiryMinutes);

    AdminAffiliationResponse approve(Long affiliationId, Long adminAccountId);

    AdminAffiliationResponse reject(Long affiliationId, Long adminAccountId, String reason);

    AdminAffiliationResponse applyToCompany(Long affiliationId, Long adminAccountId,
                                            String verifiedHrEmail, String contactNote);

    AdminAffiliationResponse revoke(Long affiliationId, Long adminAccountId, String reason);
}

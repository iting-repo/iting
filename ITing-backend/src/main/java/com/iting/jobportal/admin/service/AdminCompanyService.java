package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.CompanyApprovalRequest;
import com.iting.jobportal.admin.dto.ReviewRejectRequest;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import org.springframework.data.domain.Page;

public interface AdminCompanyService {

    Page<CompanyResponse> getAllCompanies(int page, int size);

    CompanyResponse getCompanyDetail(Long companyId);

    Page<CompanyResponse> filterCompanies(
            CompanyReviewStatus status,
            VerificationLevel verificationLevel,
            Boolean active,
            String keyword,
            int page,
            int size
    );

    void approveCompany(Long adminId, Long companyId, CompanyApprovalRequest request);

    void rejectCompany(Long adminId, Long companyId, ReviewRejectRequest request);

    void requestCompanyResubmission(Long adminId, Long companyId, ReviewRejectRequest request);

    void suspendCompany(Long adminId, Long companyId, ReviewRejectRequest request);

    void unsuspendCompany(Long adminId, Long companyId);

}
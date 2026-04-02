package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.CompanyApprovalRequest;
import com.iting.jobportal.admin.dto.response.CompanyAuditLogResponse;
import com.iting.jobportal.admin.dto.request.ReviewRejectRequest;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import org.springframework.data.domain.Page;

import java.util.List;

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

    String getCompanyBusinessLicenseViewUrl(Long adminId, Long companyId, int minutes);

    void approveCompany(Long adminId, Long companyId, CompanyApprovalRequest request);

    void rejectCompany(Long adminId, Long companyId, ReviewRejectRequest request);

    void requestCompanyResubmission(Long adminId, Long companyId, ReviewRejectRequest request);

    void suspendCompany(Long adminId, Long companyId, ReviewRejectRequest request);

    void unsuspendCompany(Long adminId, Long companyId);

    void deleteCompany(Long adminId, Long companyId);

    void bulkApproveCompanies(Long adminId, java.util.List<Long> companyIds, CompanyApprovalRequest request);

    void bulkRejectCompanies(Long adminId, java.util.List<Long> companyIds, ReviewRejectRequest request);

    void bulkSuspendCompanies(Long adminId, java.util.List<Long> companyIds, ReviewRejectRequest request);

    void bulkDeleteCompanies(Long adminId, java.util.List<Long> companyIds);

    List<CompanyAuditLogResponse> getCompanyAuditLogs(Long companyId);

    List<CompanyAuditLogResponse> getAllCompanyAuditLogs(
            com.iting.jobportal.company.entity.enums.CompanyAuditAction action,
            Long companyId,
            java.time.LocalDate fromDate,
            java.time.LocalDate toDate
    );
}
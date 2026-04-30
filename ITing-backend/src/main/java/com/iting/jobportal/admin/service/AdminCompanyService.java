package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.request.CompanyApprovalRequest;
import com.iting.jobportal.admin.dto.request.ReviewRejectRequest;
import com.iting.jobportal.admin.dto.request.CreateKybNoteRequest;
import com.iting.jobportal.admin.dto.response.CompanyAuditLogResponse;
import com.iting.jobportal.admin.dto.response.KybNoteResponse;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
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
                        int size);

        Page<CompanyResponse> getPendingReviewCompanies(int page, int size);

        List<KybNoteResponse> getCompanyKybNotes(Long companyId);

        KybNoteResponse addCompanyKybNote(Long adminId, Long companyId, CreateKybNoteRequest request);

        String getCompanyBusinessLicenseViewUrl(Long adminId, Long companyId, int minutes);

        String getCompanyConsentDocumentViewUrl(Long companyId, int minutes);

        void approveCompany(Long adminId, Long companyId, CompanyApprovalRequest request);

        void approveCompanyInfo(Long adminId, Long companyId, CompanyApprovalRequest request);

        void approveCompanyDocuments(Long adminId, Long companyId, CompanyApprovalRequest request);

        void rejectCompany(Long adminId, Long companyId, ReviewRejectRequest request);

        void rejectCompanyInfo(Long adminId, Long companyId, ReviewRejectRequest request);

        void rejectCompanyDocuments(Long adminId, Long companyId, ReviewRejectRequest request);

        void requestCompanyResubmission(Long adminId, Long companyId, ReviewRejectRequest request);

        void suspendCompany(Long adminId, Long companyId, ReviewRejectRequest request);

        void unsuspendCompany(Long adminId, Long companyId);

        void deleteCompany(Long adminId, Long companyId);

        void bulkApproveCompanies(Long adminId, java.util.List<Long> companyIds, CompanyApprovalRequest request);

        void bulkRejectCompanies(Long adminId, java.util.List<Long> companyIds, ReviewRejectRequest request);

        void bulkSuspendCompanies(Long adminId, java.util.List<Long> companyIds, ReviewRejectRequest request);

        void bulkDeleteCompanies(Long adminId, java.util.List<Long> companyIds);

        ByteArrayInputStream exportCompaniesToExcel();

        void importCompaniesFromExcel(MultipartFile file);

        ByteArrayInputStream getImportTemplate();

        List<CompanyAuditLogResponse> getCompanyAuditLogs(Long companyId);

        List<CompanyAuditLogResponse> getAllCompanyAuditLogs(
                        com.iting.jobportal.company.entity.enums.CompanyAuditAction action,
                        Long companyId,
                        java.time.LocalDate fromDate,
                        java.time.LocalDate toDate);
}
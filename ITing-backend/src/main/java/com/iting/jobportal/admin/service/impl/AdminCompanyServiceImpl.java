package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.service.AdminCompanyService;
import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyAuditLogRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.CompanyAuditService;
import com.iting.jobportal.file.FileUploadService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class    AdminCompanyServiceImpl implements AdminCompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final FileUploadService fileUploadService;
    private final CompanyAuditService companyAuditService;
    private final CompanyAuditLogRepository companyAuditLogRepository;

    @Override
    public Page<CompanyResponse> getAllCompanies(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return companyRepository.findAll(pageable)
                .map(companyMapper::toResponse);
    }

    @Override
    public CompanyResponse getCompanyDetail(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return companyMapper.toResponse(company);
    }

    @Override
    public Page<CompanyResponse> filterCompanies(CompanyReviewStatus status, VerificationLevel verificationLevel,
                                                 Boolean active, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return companyRepository.findAll(pageable)
                .map(companyMapper::toResponse);
    }

    @Override
    @Transactional
    public void approveCompany(Long adminId, Long companyId, CompanyApprovalRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getCompanyInfoUpdateStatus() != null
                ? company.getCompanyInfoUpdateStatus().name()
                : null;

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.APPROVE,
                oldStatus,
                CompanyReviewStatus.APPROVED.name(),
                request != null ? request.getNote() : null,
                "Công ty được duyệt",
                "admin#" + adminId,
                adminId
        );
    }

    @Override
    @Transactional
    public void rejectCompany(Long adminId, Long companyId, ReviewRejectRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getCompanyInfoUpdateStatus() != null
                ? company.getCompanyInfoUpdateStatus().name()
                : null;

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.REJECTED);
        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.REJECT,
                oldStatus,
                CompanyReviewStatus.REJECTED.name(),
                request != null ? request.getReason() : null,
                "Từ chối công ty",
                "admin#" + adminId,
                adminId
        );
    }

    @Override
    @Transactional
    public void requestCompanyResubmission(Long adminId, Long companyId, ReviewRejectRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getCompanyInfoUpdateStatus() != null
                ? company.getCompanyInfoUpdateStatus().name()
                : null;

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.NEEDS_RESUBMISSION);
        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.REQUEST_RESUBMISSION,
                oldStatus,
                CompanyReviewStatus.NEEDS_RESUBMISSION.name(),
                request != null ? request.getReason() : null,
                "Yêu cầu công ty bổ sung hồ sơ",
                "admin#" + adminId,
                adminId
        );
    }

    @Override
    @Transactional
    public void suspendCompany(Long adminId, Long companyId, ReviewRejectRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getCompanyInfoUpdateStatus() != null
                ? company.getCompanyInfoUpdateStatus().name()
                : null;

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.SUSPENDED);
        company.setActive(false);
        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.SUSPEND,
                oldStatus,
                CompanyReviewStatus.SUSPENDED.name(),
                request != null ? request.getReason() : null,
                "Đình chỉ công ty",
                "admin#" + adminId,
                adminId
        );
    }

    @Override
    @Transactional
    public void unsuspendCompany(Long adminId, Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getCompanyInfoUpdateStatus() != null
                ? company.getCompanyInfoUpdateStatus().name()
                : null;

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
        company.setActive(true);
        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.UNSUSPEND,
                oldStatus,
                CompanyReviewStatus.APPROVED.name(),
                null,
                "Kích hoạt lại công ty",
                "admin#" + adminId,
                adminId
        );
    }

    @Override
    public String getCompanyBusinessLicenseViewUrl(Long adminId, Long companyId, int minutes) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String fileUrl = company.getBusinessLicenseFileUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new RuntimeException("Company has not uploaded business license");
        }

        return fileUploadService.generatePresignedUrl(fileUrl, minutes);
    }

    @Override
    @Transactional
    public void deleteCompany(Long adminId, Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        companyAuditService.log(
                company,
                CompanyAuditAction.DELETE,
                company.getCompanyInfoUpdateStatus() != null ? company.getCompanyInfoUpdateStatus().name() : null,
                "DELETED",
                null,
                "Xóa công ty",
                "admin#" + adminId,
                adminId
        );

        companyRepository.delete(company);
    }

    @Override
    @Transactional
    public void bulkApproveCompanies(Long adminId, List<Long> companyIds, CompanyApprovalRequest request) {
        if (companyIds != null) {
            for (Long id : companyIds) {
                approveCompany(adminId, id, request);
            }
        }
    }


    @Override
    @org.springframework.transaction.annotation.Transactional
    public void bulkRejectCompanies(Long adminId, java.util.List<Long> companyIds, ReviewRejectRequest request) {
        if (companyIds != null) {
            for (Long id : companyIds) {
                rejectCompany(adminId, id, request);
            }
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void bulkSuspendCompanies(Long adminId, java.util.List<Long> companyIds, ReviewRejectRequest request) {
        if (companyIds != null) {
            for (Long id : companyIds) {
                suspendCompany(adminId, id, request);
            }
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void bulkDeleteCompanies(Long adminId, java.util.List<Long> companyIds) {
        if (companyIds != null) {
            for (Long id : companyIds) {
                deleteCompany(adminId, id);
            }
        }
    }

    @Override
    public List<CompanyAuditLogResponse> getCompanyAuditLogs(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        return companyAuditLogRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(log -> CompanyAuditLogResponse.builder()
                        .time(log.getCreatedAt())
                        .companyName(company.getName())
                        .action(log.getAction())
                        .fromStatus(log.getFromStatus())
                        .toStatus(log.getToStatus())
                        .reason(log.getReason())
                        .note(log.getNote())
                        .actor(log.getActor())
                        .actorId(log.getActorId())
                        .build())
                .toList();
    }

    @Override
    public List<CompanyAuditLogResponse> getAllCompanyAuditLogs(
            CompanyAuditAction action,
            Long companyId,
            java.time.LocalDate fromDate,
            java.time.LocalDate toDate
    ) {
        java.time.LocalDateTime fromDateTime =
                fromDate != null
                        ? fromDate.atStartOfDay()
                        : java.time.LocalDateTime.of(1970, 1, 1, 0, 0);

        java.time.LocalDateTime toDateTime =
                toDate != null
                        ? toDate.atTime(23, 59, 59)
                        : java.time.LocalDateTime.of(2999, 12, 31, 23, 59, 59);

        return companyAuditLogRepository.findAllWithCompanyFiltered(
                action,
                companyId,
                fromDateTime,
                toDateTime
        );
    }


}
package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.request.CompanyApprovalRequest;
import com.iting.jobportal.admin.dto.request.ReviewRejectRequest;
import com.iting.jobportal.admin.dto.response.CompanyAuditLogResponse;
import com.iting.jobportal.admin.service.AdminCompanyService;
import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyAuditLogRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.CompanyAuditService;
import com.iting.jobportal.file.FileUploadService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.iting.jobportal.company.repository.CompanyKybNoteRepository;
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
    private final CompanyKybNoteRepository companyKybNoteRepository;

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
    public Page<CompanyResponse> getPendingReviewCompanies(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "lastUpdateRequestDate"));
        return companyRepository.findByCompanyInfoUpdateStatusOrDocumentReviewStatus(CompanyReviewStatus.PENDING_REVIEW, DocumentReviewStatus.PENDING_REVIEW, pageable)
                .map(companyMapper::toResponse);
    }

    @Override
    public List<com.iting.jobportal.admin.dto.response.KybNoteResponse> getCompanyKybNotes(Long companyId) {
        return companyKybNoteRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(note -> com.iting.jobportal.admin.dto.response.KybNoteResponse.builder()
                        .id(note.getId())
                        .companyId(note.getCompany().getId())
                        .adminId(note.getAdminId())
                        .noteContent(note.getNoteContent())
                        .createdAt(note.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public com.iting.jobportal.admin.dto.response.KybNoteResponse addCompanyKybNote(Long adminId, Long companyId, com.iting.jobportal.admin.dto.request.CreateKybNoteRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        com.iting.jobportal.company.entity.CompanyKybNote note = new com.iting.jobportal.company.entity.CompanyKybNote();
        note.setCompany(company);
        note.setAdminId(adminId);
        note.setNoteContent(request.getContent());
        note = companyKybNoteRepository.save(note);

        return com.iting.jobportal.admin.dto.response.KybNoteResponse.builder()
                .id(note.getId())
                .companyId(note.getCompany().getId())
                .adminId(note.getAdminId())
                .noteContent(note.getNoteContent())
                .createdAt(note.getCreatedAt())
                .build();
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
        company.setStatusReason(request != null ? request.getNote() : null);

        // Update verificationLevel if provided
        if (request != null && request.getVerificationLevel() != null) {
            company.setVerificationLevel(request.getVerificationLevel());
        }

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
    public void approveCompanyInfo(Long adminId, Long companyId, CompanyApprovalRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getCompanyInfoUpdateStatus() != null
                ? company.getCompanyInfoUpdateStatus().name()
                : null;

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
        
        // Cập nhật mức xác thực lên BASIC nếu đang là UNVERIFIED
        if (company.getVerificationLevel() == VerificationLevel.UNVERIFIED) {
            company.setVerificationLevel(VerificationLevel.BASIC);
        }

        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.APPROVE,
                oldStatus,
                CompanyReviewStatus.APPROVED.name(),
                request != null ? request.getNote() : null,
                "Thông tin cơ bản công ty được duyệt",
                "admin#" + adminId,
                adminId
        );
    }

    @Override
    @Transactional
    public void approveCompanyDocuments(Long adminId, Long companyId, CompanyApprovalRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getDocumentReviewStatus() != null
                ? company.getDocumentReviewStatus().name()
                : null;

        company.setDocumentReviewStatus(DocumentReviewStatus.APPROVED);
        
        // Nếu thông tin cơ bản đã duyệt thì lên ADVANCED
        if (company.getCompanyInfoUpdateStatus() == CompanyReviewStatus.APPROVED) {
            company.setVerificationLevel(VerificationLevel.ADVANCED);
        }

        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.APPROVE,
                oldStatus,
                DocumentReviewStatus.APPROVED.name(),
                request != null ? request.getNote() : null,
                "Giấy tờ pháp lý công ty được duyệt",
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
        company.setStatusReason(request != null ? request.getReason() : null);
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
    public void rejectCompanyInfo(Long adminId, Long companyId, ReviewRejectRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getCompanyInfoUpdateStatus() != null
                ? company.getCompanyInfoUpdateStatus().name()
                : null;

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.REJECTED);
        company.setStatusReason(request != null ? request.getReason() : null);
        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.REJECT,
                oldStatus,
                CompanyReviewStatus.REJECTED.name(),
                request != null ? request.getReason() : null,
                "Từ chối thông tin cơ bản công ty",
                "admin#" + adminId,
                adminId
        );
    }

    @Override
    @Transactional
    public void rejectCompanyDocuments(Long adminId, Long companyId, ReviewRejectRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String oldStatus = company.getDocumentReviewStatus() != null
                ? company.getDocumentReviewStatus().name()
                : null;

        company.setDocumentReviewStatus(DocumentReviewStatus.REJECTED);
        company.setStatusReason(request != null ? request.getReason() : null);
        companyRepository.save(company);

        companyAuditService.log(
                company,
                CompanyAuditAction.REJECT,
                oldStatus,
                DocumentReviewStatus.REJECTED.name(),
                request != null ? request.getReason() : null,
                "Từ chối giấy tờ pháp lý công ty",
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
        company.setStatusReason(request != null ? request.getReason() : null);
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
        company.setStatusReason(request != null ? request.getReason() : null);
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
        company.setStatusReason(null); // Clear reason when unsuspending
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
    public String getCompanyConsentDocumentViewUrl(Long companyId, int minutes) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String fileUrl = company.getConsentDocumentFileUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new RuntimeException("Company has not uploaded consent document");
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

        return companyAuditLogRepository.findByCompany_IdOrderByCreatedAtDesc(companyId)
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

    private CompanyAuditLogResponse mapToResponse(com.iting.jobportal.admin.dto.response.CompanyAuditLogView view) {
        return CompanyAuditLogResponse.builder()
                .time(view.getCreatedAt())
                .companyName(view.getCompanyName())
                .action(view.getAction())
                .fromStatus(view.getFromStatus())
                .toStatus(view.getToStatus())
                .reason(view.getReason())
                .note(view.getNote())
                .actor(view.getActor())
                .actorId(view.getActorId())
                .build();
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
                ).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public java.io.ByteArrayInputStream exportCompaniesToExcel() {
        List<Company> companies = companyRepository.findAll();
        String[] headers = {"ID", "Name", "Tax Code", "Status", "Verification Level", "Email", "Phone"};
        
        return com.iting.jobportal.common.excel.ExcelHelper.dataToExcel(
                companies, 
                headers, 
                "Companies",
                (company, row) -> {
                    row.createCell(0).setCellValue(company.getId());
                    row.createCell(1).setCellValue(company.getName());
                    row.createCell(2).setCellValue(company.getTaxCode());
                    row.createCell(3).setCellValue(company.getCompanyInfoUpdateStatus() != null ? company.getCompanyInfoUpdateStatus().name() : "");
                    row.createCell(4).setCellValue(company.getVerificationLevel() != null ? company.getVerificationLevel().name() : "");
                    row.createCell(5).setCellValue(company.getCompanyEmail());
                    row.createCell(6).setCellValue(company.getPhone());
                }
        );
    }

    @Override
    @jakarta.transaction.Transactional
    public void importCompaniesFromExcel(org.springframework.web.multipart.MultipartFile file) {
        try {
            List<Company> companies = com.iting.jobportal.common.excel.ExcelHelper.excelToData(
                    file.getInputStream(),
                    row -> {
                        Company company = new Company();
                        company.setName(row.getCell(0).getStringCellValue());
                        company.setTaxCode(row.getCell(1).getStringCellValue());
                        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);
                        company.setVerificationLevel(VerificationLevel.UNVERIFIED);
                        return company;
                    }
            );
            companyRepository.saveAll(companies);
        } catch (java.io.IOException e) {
            throw new RuntimeException("fail to store excel data: " + e.getMessage());
        }
    }

    @Override
    public java.io.ByteArrayInputStream getImportTemplate() {
        String[] headers = {"Company Name", "Tax Code"};
        return com.iting.jobportal.common.excel.ExcelHelper.createTemplate(headers, "Company Import Template");
    }
}
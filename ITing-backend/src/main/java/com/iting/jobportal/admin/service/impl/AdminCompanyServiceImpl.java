package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.service.AdminCompanyService;
import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.file.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminCompanyServiceImpl implements AdminCompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final FileUploadService fileUploadService;

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
    public void approveCompany(Long adminId, Long companyId, CompanyApprovalRequest request) {
        Company company = companyRepository.findById(companyId).orElseThrow();
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
        companyRepository.save(company);
    }

    @Override
    public void rejectCompany(Long adminId, Long companyId, ReviewRejectRequest request) {
        Company company = companyRepository.findById(companyId).orElseThrow();
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.REJECTED);
        companyRepository.save(company);
    }

    @Override
    public void requestCompanyResubmission(Long adminId, Long companyId, ReviewRejectRequest request) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.NEEDS_RESUBMISSION);

        companyRepository.save(company);
    }

    @Override
    public void suspendCompany(Long adminId, Long companyId, ReviewRejectRequest request) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.SUSPENDED);
        company.setActive(false);

        companyRepository.save(company);
    }

    @Override
    public void unsuspendCompany(Long adminId, Long companyId) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.APPROVED);
        company.setActive(true);

        companyRepository.save(company);
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
}
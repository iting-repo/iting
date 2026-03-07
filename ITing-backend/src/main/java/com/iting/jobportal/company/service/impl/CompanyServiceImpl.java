package com.iting.jobportal.company.service.impl;

import com.iting.jobportal.company.dto.request.*;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    // ==========================
    // 1. Lấy thông tin công ty
    // ==========================
    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        return mapToResponse(company);
    }

    // ====================================
    // 2. Cập nhật thông tin cơ bản (Trang 1)
    // ====================================
    @Override
    public CompanyResponse updateBasicInfo(Long id, CompanyBasicInfoRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        company.setName(request.getName());
        company.setLogoUrl(request.getLogoUrl());
        company.setAddress(request.getAddress());
        company.setDescription(request.getDescription());
        company.setWebsite(request.getWebsite());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());

        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ==========================================
    // 3. Cập nhật người đại diện (Trang 2)
    // ==========================================
    @Override
    public CompanyResponse updateRepresentative(Long id, CompanyRepresentativeRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        company.setRepresentativeName(request.getRepresentativeName());
        company.setRepresentativeGender(request.getRepresentativeGender());
        company.setRepresentativePhone(request.getRepresentativePhone());
        company.setAccountEmail(request.getAccountEmail());

        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ====================================================
    // 4. Upload giấy đăng ký doanh nghiệp (Trang 3)
    // ====================================================
    @Override
    public CompanyResponse updateBusinessLicense(Long id, BusinessLicenseUploadRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        company.setBusinessLicenseFileUrl(request.getBusinessLicenseFileUrl());
        // Có thể set trạng thái yêu cầu cập nhật, ví dụ:
        // company.setCompanyInfoUpdateStatus("BUSINESS_LICENSE_UPLOADED");

        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ====================================================
    // 5. Upload văn bản thỏa thuận dữ liệu cá nhân (Trang 4)
    // ====================================================
    @Override
    public CompanyResponse updateConsentDocument(Long id, ConsentDocumentUploadRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        company.setConsentDocumentFileUrl(request.getConsentDocumentFileUrl());
        // company.setCompanyInfoUpdateStatus("CONSENT_DOCUMENT_UPLOADED");

        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ==========================================
    // 6. Xác thực số điện thoại (Trang 5)
    // ==========================================
    @Override
    public void verifyPhone(Long id, VerifyPhoneRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        // Ở đây tuỳ hệ thống:
        // - Bạn có thể gọi service OTP để verify
        // - Hoặc kiểm tra mã OTP đã lưu ở nơi khác
        //
        // Vì chưa có field lưu trạng thái xác thực phone trong Company entity,
        // nên tạm thời chỉ demo logic validate dạng đơn giản.

        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new IllegalArgumentException("Phone must not be blank");
        }

        if (request.getOtpCode() == null || request.getOtpCode().isBlank()) {
            throw new IllegalArgumentException("OTP code must not be blank");
        }

        // TODO: Thực hiện logic verify OTP thực tế ở đây.
        // Ví dụ: otpService.verify(company.getId(), request.getPhone(),
        // request.getOtpCode());

        // Nếu sau này bạn thêm field kiểu Boolean phoneVerified trong Company,
        // bạn có thể set:
        // company.setPhoneVerified(true);
        // company.setLastUpdate(LocalDateTime.now());
        // companyRepository.save(company);
    }

    // ==========================================
    // 7. Xác thực giấy tờ doanh nghiệp (Trang 6)
    // ==========================================
    @Override
    public CompanyResponse verifyLicense(Long id, VerifyLicenseRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

        if (request.getVerificationLevel() != null) {
            company.setVerificationLevel(request.getVerificationLevel());
        }

        if (request.getCompanyInfoUpdateStatus() != null) {
            company.setCompanyInfoUpdateStatus(request.getCompanyInfoUpdateStatus());
        }

        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ==========================================
    // 8. Hàm map Company -> CompanyResponse
    // ==========================================
    private CompanyResponse mapToResponse(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getLogoUrl(),
                company.getAddress(),
                company.getDescription(),
                company.getWebsite(),
                company.getIndustry(),
                company.getCompanyEmail(),
                company.getCompanySize(),
                company.getRepresentativeName(),
                company.getRepresentativeGender(),
                company.getRepresentativePhone(),
                company.getAccountEmail(),
                company.getTaxCode(),
                company.getBusinessLicenseFileUrl(),
                company.getConsentDocumentFileUrl(),
                company.getVerificationLevel(),
                company.getCompanyInfoUpdateStatus(),
                company.getLastUpdateRequestDate(),
                company.getLastUpdate(),
                company.getActive());
    }
}

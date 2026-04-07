package com.iting.jobportal.company.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.dto.request.*;
import com.iting.jobportal.company.dto.response.BusinessLicenseFormResponse;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.company.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.company.entity.enums.BusinessDocumentType;

import java.time.LocalDateTime;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyFollowService companyFollowService;
    private final FileUploadService fileUploadService;
    private final AccountRepository accountRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository,
                              CompanyFollowService companyFollowService,
                              FileUploadService fileUploadService,
                              AccountRepository accountRepository) {
        this.companyRepository = companyRepository;
        this.companyFollowService = companyFollowService;
        this.fileUploadService = fileUploadService;
        this.accountRepository = accountRepository;
    }
    @Override
    @Transactional
    public CompanyResponse getMyCompany(Long accountId) {
        Company company = companyRepository.findById(accountId).orElseGet(() -> {
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));

            if (account.getRole() == null || account.getRole().normalize() != Role.EMPLOYER) {
                throw new IllegalArgumentException("Tài khoản này không phải nhà tuyển dụng");
            }

            Company c = new Company();
            c.setId(account.getId());
            c.setAccount(account);
            c.setName("Chưa cập nhật");
            c.setAccountEmail(account.getEmail());
            c.setCompanyEmail(account.getEmail());
            c.setVerificationLevel(VerificationLevel.UNVERIFIED);
            c.setCompanyInfoUpdateStatus(CompanyReviewStatus.DRAFT);
            c.setActive(true);
            c.setFollowerCount(0L);
            c.setProfileSetup(false);
            c.setLastUpdate(LocalDateTime.now());
            return companyRepository.save(c);
        });

        return mapToResponse(company);
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
    // 2. Cập nhật thông tin cơ bản
    // ====================================
    @Override
    public CompanyResponse updateBasicInfo(Long id, CompanyBasicInfoRequest request) {
        return updateBasicInfoByAccountId(id, request);
    }

    @Override
    public CompanyResponse updateBasicInfoByAccountId(Long accountId, CompanyBasicInfoRequest request) {
        Company company = getCompanyByAccountId(accountId);

        company.setName(request.getName());
        company.setLogoUrl(request.getLogoUrl());
        company.setAddress(request.getAddress());
        company.setDescription(request.getDescription());
        company.setWebsite(request.getWebsite());
        company.setCompanyEmail(request.getCompanyEmail());
        company.setIndustries(request.getIndustries());
        company.setCompanySize(request.getCompanySize());
        company.setPhone(request.getPhone());
        company.setTaxCode(request.getTaxCode());
        company.setLastUpdate(LocalDateTime.now());

        // Chuyển trạng thái sang PENDING_REVIEW khi cập nhật thông tin
        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);
        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());
        company.setProfileSetup(true);

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ==========================================
    // 3. Cập nhật người đại diện
    // ==========================================
    @Override
    public CompanyResponse updateRepresentative(Long id, CompanyRepresentativeRequest request) {
        return updateRepresentativeByAccountId(id, request);
    }

    @Override
    public CompanyResponse updateRepresentativeByAccountId(Long accountId, CompanyRepresentativeRequest request) {
        Company company = getCompanyByAccountId(accountId);

        company.setRepresentativeName(request.getRepresentativeName());
        company.setRepresentativeGender(request.getRepresentativeGender());
        company.setRepresentativePhone(request.getRepresentativePhone());
        company.setAccountEmail(request.getAccountEmail());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ====================================================
    // 4. Upload giấy đăng ký doanh nghiệp
    // ====================================================
    @Override
    public CompanyResponse updateBusinessLicense(Long id, BusinessLicenseUploadRequest request) {
        return updateBusinessLicenseByAccountId(id, request);
    }

    @Override
    public CompanyResponse updateBusinessLicenseByAccountId(Long accountId, BusinessLicenseUploadRequest request) {
        Company company = getCompanyByAccountId(accountId);

        MultipartFile file = request.getFile();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file PDF");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("File phải có đuôi .pdf");
        }

        if (company.getBusinessLicenseFileUrl() != null && !company.getBusinessLicenseFileUrl().isBlank()) {
            fileUploadService.deleteByUrl(company.getBusinessLicenseFileUrl());
        }

        String fileUrl = fileUploadService.uploadBusinessLicense(file);

        company.setBusinessLicenseFileUrl(fileUrl);
         company.setBusinessLicenseDocumentType(BusinessDocumentType.BUSINESS_LICENSE);
        // company.setBusinessLicensePreviewUrl(fileUrl);

        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public String getBusinessLicensePresignedUrlByAccountId(Long accountId, int minutes) {
        Company company = getCompanyByAccountId(accountId);

        String fileUrl = company.getBusinessLicenseFileUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("Công ty chưa tải giấy phép kinh doanh");
        }

        return fileUploadService.generatePresignedUrl(fileUrl, minutes);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessLicenseFormResponse getBusinessLicenseForm(Long id) {
        return getBusinessLicenseFormByAccountId(id);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessLicenseFormResponse getBusinessLicenseFormByAccountId(Long accountId) {
        Company company = getCompanyByAccountId(accountId);

        return new BusinessLicenseFormResponse(
                company.getId(),
                company.getBusinessLicenseDocumentType(),
                company.getBusinessLicenseFileUrl(),
                company.getBusinessLicensePreviewUrl(),
                company.getCompanyInfoUpdateStatus()
        );
    }

    // ====================================================
    // 5. Upload văn bản thỏa thuận dữ liệu cá nhân
    // ====================================================
    @Override
    public CompanyResponse updateConsentDocument(Long id, ConsentDocumentUploadRequest request) {
        return updateConsentDocumentByAccountId(id, request);
    }

    @Override
    public CompanyResponse updateConsentDocumentByAccountId(Long accountId, ConsentDocumentUploadRequest request) {
        Company company = getCompanyByAccountId(accountId);

        MultipartFile file = request.getFile();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File văn bản thỏa thuận không được để trống");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }

        String lowerName = originalFilename.toLowerCase();
        boolean allowed = lowerName.endsWith(".pdf") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx");
        if (!allowed) {
            throw new IllegalArgumentException("Chỉ chấp nhận file pdf, doc, docx");
        }

        if (request.getConfirmed() == null || !request.getConfirmed()) {
            throw new IllegalArgumentException("Bạn phải xác nhận cam kết trước khi lưu");
        }

        if (company.getConsentDocumentFileUrl() != null && !company.getConsentDocumentFileUrl().isBlank()) {
            fileUploadService.deleteByUrl(company.getConsentDocumentFileUrl());
        }

        String fileUrl = fileUploadService.uploadConsentDocument(file);

        company.setConsentDocumentFileUrl(fileUrl);
        company.setConsentDocumentConfirmed(true);
        company.setConsentConfirmedAt(LocalDateTime.now());
        company.setConsentDocumentVersion(
                request.getVersion() == null || request.getVersion().isBlank()
                        ? "v1.0"
                        : request.getVersion()
        );

        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ==========================================
    // 6. Xác thực số điện thoại
    // ==========================================
    @Override
    public void verifyPhone(Long id, VerifyPhoneRequest request) {
        verifyPhoneByAccountId(id, request);
    }

    @Override
    public void verifyPhoneByAccountId(Long accountId, VerifyPhoneRequest request) {
        Company company = getCompanyByAccountId(accountId);

        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new IllegalArgumentException("Phone must not be blank");
        }

        if (request.getOtpCode() == null || request.getOtpCode().isBlank()) {
            throw new IllegalArgumentException("OTP code must not be blank");
        }

        // TODO: Thực hiện logic verify OTP thực tế ở đây
        // otpService.verify(company.getId(), request.getPhone(), request.getOtpCode());

        company.setLastUpdate(LocalDateTime.now());
        companyRepository.save(company);
    }

    // ==========================================
    // 7. Xác thực giấy tờ doanh nghiệp
    // ==========================================
    @Override
    public CompanyResponse verifyLicense(Long id, VerifyLicenseRequest request) {
        return verifyLicenseByAccountId(id, request);
    }

    @Override
    public CompanyResponse verifyLicenseByAccountId(Long accountId, VerifyLicenseRequest request) {
        Company company = getCompanyByAccountId(accountId);

        if (request.getVerificationLevel() != null) {
            company.setVerificationLevel(request.getVerificationLevel());
        }

        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ==========================================
    // 8. Submit for Review
    // ==========================================
    @Override
    public CompanyResponse submitForReview(Long id) {
        return submitForReviewByAccountId(id);
    }

    @Override
    public CompanyResponse submitForReviewByAccountId(Long accountId) {
        Company company = getCompanyByAccountId(accountId);

        if (company.getName() == null || company.getName().isBlank()) {
            throw new IllegalArgumentException("Tên công ty không được để trống");
        }
        if (company.getCompanyEmail() == null || company.getCompanyEmail().isBlank()) {
            throw new IllegalArgumentException("Email công ty không được để trống");
        }
        if (company.getPhone() == null || company.getPhone().isBlank()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống");
        }
        if (company.getRepresentativeName() == null || company.getRepresentativeName().isBlank()) {
            throw new IllegalArgumentException("Tên người đại diện không được để trống");
        }
        if (company.getTaxCode() == null || company.getTaxCode().isBlank()) {
            throw new IllegalArgumentException("Mã số thuế không được để trống");
        }
        if (company.getBusinessLicenseFileUrl() == null || company.getBusinessLicenseFileUrl().isBlank()) {
            throw new IllegalArgumentException("Giấy phép kinh doanh không được để trống");
        }

        if (company.getConsentDocumentFileUrl() == null || company.getConsentDocumentFileUrl().isBlank()) {
            throw new IllegalArgumentException("Văn bản thỏa thuận dữ liệu cá nhân không được để trống");
        }
        if (Boolean.FALSE.equals(company.getConsentDocumentConfirmed())) {
            throw new IllegalArgumentException("Bạn chưa xác nhận cam kết cho văn bản thỏa thuận");
        }
        if (company.getConsentDocumentVersion() == null || company.getConsentDocumentVersion().isBlank()) {
            throw new IllegalArgumentException("Phiên bản văn bản thỏa thuận không được để trống");
        }

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);
        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    // ==========================================
    // Helper
    // ==========================================
    private Company getCompanyByAccountId(Long accountId) {
        return companyRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công ty của tài khoản này"));
    }

    // ==========================================
    // Map Company -> CompanyResponse
    // ==========================================
    private CompanyResponse mapToResponse(Company company) {
        return CompanyResponse.fromEntity(company);
    }
}
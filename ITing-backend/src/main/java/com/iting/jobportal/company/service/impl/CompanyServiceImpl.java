package com.iting.jobportal.company.service.impl;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.dto.request.*;
import com.iting.jobportal.company.dto.response.BusinessLicenseFormResponse;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.company.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.context.ApplicationEventPublisher;
import com.iting.jobportal.company.event.CompanyInfoSubmittedEvent;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.entity.enums.Industry;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

import java.time.LocalDateTime;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyFollowService companyFollowService;
    private final FileUploadService fileUploadService;
    private final AccountRepository accountRepository;
    private final JobRepository jobRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final CompanyMapper companyMapper;
    private final com.iting.jobportal.company.repository.CompanyReviewRepository companyReviewRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository,
                              CompanyFollowService companyFollowService,
                              FileUploadService fileUploadService,
                              AccountRepository accountRepository,
                              JobRepository jobRepository,
                              ApplicationEventPublisher eventPublisher,
                              CompanyMapper companyMapper,
                              com.iting.jobportal.company.repository.CompanyReviewRepository companyReviewRepository) {
        this.companyRepository = companyRepository;
        this.companyFollowService = companyFollowService;
        this.fileUploadService = fileUploadService;
        this.accountRepository = accountRepository;
        this.jobRepository = jobRepository;
        this.eventPublisher = eventPublisher;
        this.companyMapper = companyMapper;
        this.companyReviewRepository = companyReviewRepository;
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
            c.setAccount(account);
            c.setName("Chưa cập nhật");
            c.setAccountEmail(account.getEmail());
            c.setCompanyEmail(account.getEmail());
            c.setVerificationLevel(VerificationLevel.UNVERIFIED);
            c.setCompanyInfoUpdateStatus(CompanyReviewStatus.DRAFT);
            c.setDocumentReviewStatus(DocumentReviewStatus.MISSING);
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

        // Chuyển trạng thái sang DRAFT khi cập nhật thông tin. Cần bấm "Gửi duyệt" để sang PENDING_REVIEW.
        if (company.getCompanyInfoUpdateStatus() != CompanyReviewStatus.PENDING_REVIEW) {
            company.setCompanyInfoUpdateStatus(CompanyReviewStatus.DRAFT);
        }
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
        if (contentType == null) {
            throw new IllegalArgumentException("Không xác định được loại file");
        }

        boolean isValidType = contentType.equalsIgnoreCase("application/pdf") ||
                             contentType.equalsIgnoreCase("image/jpeg") ||
                             contentType.equalsIgnoreCase("image/jpg") ||
                             contentType.equalsIgnoreCase("image/png");

        if (!isValidType) {
            throw new IllegalArgumentException("Chỉ chấp nhận file PDF hoặc hình ảnh (JPEG, PNG)");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
             throw new IllegalArgumentException("Tên file không hợp lệ");
        }
        
        String lowerName = originalFilename.toLowerCase();
        boolean isValidExt = lowerName.endsWith(".pdf") || 
                            lowerName.endsWith(".jpg") || 
                            lowerName.endsWith(".jpeg") || 
                            lowerName.endsWith(".png");
                            
        if (!isValidExt) {
            throw new IllegalArgumentException("Phần mở rộng file không hợp lệ. Chỉ chấp nhận .pdf, .jpg, .jpeg, .png");
        }

        if (company.getBusinessLicenseFileUrl() != null && !company.getBusinessLicenseFileUrl().isBlank()) {
            fileUploadService.deleteByUrl(company.getBusinessLicenseFileUrl());
        }

        String fileUrl = fileUploadService.uploadBusinessLicense(file);

        company.setBusinessLicenseFileUrl(fileUrl);
        company.setBusinessLicenseDocumentType(BusinessDocumentType.BUSINESS_LICENSE);
        // company.setBusinessLicensePreviewUrl(fileUrl);
        company.setDocumentReviewStatus(DocumentReviewStatus.UPLOADED);

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
    public CompanyResponse submitInfoReview(Long id) {
        return submitInfoReviewByAccountId(id);
    }

    @Override
    public CompanyResponse submitInfoReviewByAccountId(Long accountId) {
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

        company.setCompanyInfoUpdateStatus(CompanyReviewStatus.PENDING_REVIEW);
        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        
        eventPublisher.publishEvent(new CompanyInfoSubmittedEvent(this, saved.getId(), saved.getName()));
        
        return mapToResponse(saved);
    }

    @Override
    public CompanyResponse submitDocumentReview(Long id) {
        return submitDocumentReviewByAccountId(id);
    }

    @Override
    public CompanyResponse submitDocumentReviewByAccountId(Long accountId) {
        Company company = getCompanyByAccountId(accountId);

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

        company.setDocumentReviewStatus(DocumentReviewStatus.PENDING_REVIEW);
        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    @Override
    public CompanyResponse submitBusinessLicenseReviewByAccountId(Long accountId) {
        Company company = getCompanyByAccountId(accountId);

        if (company.getBusinessLicenseFileUrl() == null || company.getBusinessLicenseFileUrl().isBlank()) {
            throw new IllegalArgumentException("Bạn chưa tải lên Giấy phép kinh doanh");
        }

        company.setDocumentReviewStatus(DocumentReviewStatus.PENDING_REVIEW);
        company.setLastUpdateRequestDate(LocalDateTime.now());
        company.setLastUpdate(LocalDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    @Override
    public CompanyResponse submitConsentDocumentReviewByAccountId(Long accountId) {
        Company company = getCompanyByAccountId(accountId);

        if (company.getConsentDocumentFileUrl() == null || company.getConsentDocumentFileUrl().isBlank()) {
            throw new IllegalArgumentException("Bạn chưa tải lên Văn bản thỏa thuận dữ liệu cá nhân");
        }
        if (Boolean.FALSE.equals(company.getConsentDocumentConfirmed())) {
            throw new IllegalArgumentException("Bạn chưa xác nhận cam kết cho văn bản thỏa thuận");
        }

        company.setDocumentReviewStatus(DocumentReviewStatus.PENDING_REVIEW);
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
        CompanyResponse response = companyMapper.toResponse(company);
        response.setActiveJobCount((int) jobRepository.countActiveAndNotExpiredByCompanyId(company.getId()));
        response.setFollowerCount(companyFollowService.getFollowerCount(company.getId()));
        // Set average rating & review count
        Double avgRating = companyReviewRepository.getAverageRating(company.getId());
        response.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null);
        response.setReviewCount(companyReviewRepository.countByCompanyId(company.getId()));
        return response;
    }

    @Override
    public Page<CompanyResponse> searchCompanies(String keyword, String location, String industry, String size, int page, int sizePage) {
        Pageable pageable = PageRequest.of(page, sizePage, Sort.by("lastUpdate").descending());

        Specification<Company> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String kw = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), kw),
                        cb.like(cb.lower(root.get("description")), kw)
                ));
            }

            if (location != null && !location.isBlank() && !location.equalsIgnoreCase("all")) {
                predicates.add(cb.like(root.get("address"), "%" + location + "%"));
            }

            if (industry != null && !industry.isBlank() && !industry.equalsIgnoreCase("all")) {
                try {
                    Industry ind = Industry.valueOf(industry.toUpperCase());
                    predicates.add(cb.isMember(ind, root.get("industries")));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid enum values
                }
            }
            
            if (size != null && !size.isBlank() && !size.equalsIgnoreCase("all")) {
                predicates.add(cb.equal(root.get("companySize"), size));
            }
            
            // Only show setup profiles
            predicates.add(cb.equal(root.get("profileSetup"), true));
            
            // Only show active companies (exclude suspended)
            predicates.add(cb.equal(root.get("active"), true));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return companyRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    public String uploadLogoByAccountId(Long accountId, MultipartFile file) {
        Company company = getCompanyByAccountId(accountId);

        if (company.getLogoUrl() != null && !company.getLogoUrl().isBlank()) {
            fileUploadService.deleteByUrl(company.getLogoUrl());
        }

        String url = fileUploadService.uploadLogo(file);
        company.setLogoUrl(url);
        company.setLastUpdate(LocalDateTime.now());
        companyRepository.save(company);

        return url;
    }
}
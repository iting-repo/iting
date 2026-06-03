package com.iting.jobportal.company.service.impl;

import com.iting.jobportal.auth.entity.OtpCode;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.repository.OtpCodeRepository;
import com.iting.jobportal.common.cache.CacheNames;
import com.iting.jobportal.company.dto.mapper.CompanyMapper;
import com.iting.jobportal.company.dto.request.*;
import com.iting.jobportal.company.dto.response.BusinessLicenseFormResponse;
import com.iting.jobportal.company.dto.response.CompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.BusinessDocumentType;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.entity.enums.Industry;
import com.iting.jobportal.company.event.CompanyInfoSubmittedEvent;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.company.service.CompanyService;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.job.repository.JobRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

  private static final org.slf4j.Logger log =
      org.slf4j.LoggerFactory.getLogger(CompanyServiceImpl.class);
  private static final String PHONE_OTP_KEY_PREFIX = "phone:";

  private final CompanyRepository companyRepository;
  private final CompanyFollowService companyFollowService;
  private final FileUploadService fileUploadService;
  private final AccountRepository accountRepository;
  private final JobRepository jobRepository;
  private final ApplicationEventPublisher eventPublisher;
  private final CompanyMapper companyMapper;
  private final AuthorizationService authz;
  private final com.iting.jobportal.company.repository.CompanyReviewRepository
      companyReviewRepository;
  private final OtpCodeRepository otpCodeRepository;

  public CompanyServiceImpl(
      CompanyRepository companyRepository,
      CompanyFollowService companyFollowService,
      FileUploadService fileUploadService,
      AccountRepository accountRepository,
      JobRepository jobRepository,
      ApplicationEventPublisher eventPublisher,
      CompanyMapper companyMapper,
      AuthorizationService authz,
      com.iting.jobportal.company.repository.CompanyReviewRepository companyReviewRepository,
      OtpCodeRepository otpCodeRepository) {
    this.companyRepository = companyRepository;
    this.companyFollowService = companyFollowService;
    this.fileUploadService = fileUploadService;
    this.accountRepository = accountRepository;
    this.jobRepository = jobRepository;
    this.eventPublisher = eventPublisher;
    this.companyMapper = companyMapper;
    this.authz = authz;
    this.companyReviewRepository = companyReviewRepository;
    this.otpCodeRepository = otpCodeRepository;
  }

  @Override
  @Transactional
  public CompanyResponse getMyCompany(Long accountId) {
    // Sau Phase 2: resolve company qua affiliation thay vì giả định accountId == companyId.
    // Auto-create cho HR mới đã được dời sang endpoint POST /api/hr/affiliations/me/init (Phase 3);
    // tại đây nếu HR chưa khởi tạo affiliation → trả 403.
    Long companyId = authz.requireCompanyOf(accountId);
    Company company =
        companyRepository
            .findById(companyId)
            .orElseThrow(
                () -> new IllegalArgumentException("Không tìm thấy công ty của tài khoản này"));
    return mapToResponse(company);
  }

  // ==========================
  // 1. Lấy thông tin công ty
  // ==========================
  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = CacheNames.COMPANY_DETAIL, key = "#id", unless = "#result == null")
  public CompanyResponse getCompanyById(Long id) {
    Company company =
        companyRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));

    return mapToResponse(company);
  }

  // ====================================
  // 2. Cập nhật thông tin cơ bản
  // ====================================
  @Override
  @CacheEvict(value = CacheNames.COMPANY_DETAIL, key = "#id")
  public CompanyResponse updateBasicInfo(Long id, CompanyBasicInfoRequest request) {
    return updateBasicInfoByAccountId(id, request);
  }

  @Override
  public CompanyResponse updateBasicInfoByAccountId(
      Long accountId, CompanyBasicInfoRequest request) {
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

    // Chuyển trạng thái sang DRAFT khi cập nhật thông tin. Cần bấm "Gửi duyệt" để sang
    // PENDING_REVIEW.
    if (company.getCompanyReviewStatus() != CompanyReviewStatus.PENDING_REVIEW) {
      company.setCompanyReviewStatus(CompanyReviewStatus.DRAFT);
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
  public CompanyResponse updateRepresentativeByAccountId(
      Long accountId, CompanyRepresentativeRequest request) {
    Company company = getCompanyByAccountId(accountId);

    company.setRepresentativeName(request.getRepresentativeName());
    company.setRepresentativeGender(request.getRepresentativeGender());
    company.setRepresentativePhone(request.getRepresentativePhone());

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
  public CompanyResponse updateBusinessLicenseByAccountId(
      Long accountId, BusinessLicenseUploadRequest request) {
    Company company = getCompanyByAccountId(accountId);

    MultipartFile file = request.getFile();

    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File không được để trống");
    }

    String contentType = file.getContentType();
    if (contentType == null) {
      throw new IllegalArgumentException("Không xác định được loại file");
    }

    boolean isValidType =
        contentType.equalsIgnoreCase("application/pdf")
            || contentType.equalsIgnoreCase("image/jpeg")
            || contentType.equalsIgnoreCase("image/jpg")
            || contentType.equalsIgnoreCase("image/png");

    if (!isValidType) {
      throw new IllegalArgumentException("Chỉ chấp nhận file PDF hoặc hình ảnh (JPEG, PNG)");
    }

    String originalFilename = file.getOriginalFilename();
    if (originalFilename == null) {
      throw new IllegalArgumentException("Tên file không hợp lệ");
    }

    String lowerName = originalFilename.toLowerCase();
    boolean isValidExt =
        lowerName.endsWith(".pdf")
            || lowerName.endsWith(".jpg")
            || lowerName.endsWith(".jpeg")
            || lowerName.endsWith(".png");

    if (!isValidExt) {
      throw new IllegalArgumentException(
          "Phần mở rộng file không hợp lệ. Chỉ chấp nhận .pdf, .jpg, .jpeg, .png");
    }

    if (company.getBusinessLicenseFileUrl() != null
        && !company.getBusinessLicenseFileUrl().isBlank()) {
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
        company.getCompanyReviewStatus());
  }

  // ====================================================
  // 5. Upload văn bản thỏa thuận dữ liệu cá nhân
  // ====================================================
  @Override
  public CompanyResponse updateConsentDocument(Long id, ConsentDocumentUploadRequest request) {
    return updateConsentDocumentByAccountId(id, request);
  }

  @Override
  public CompanyResponse updateConsentDocumentByAccountId(
      Long accountId, ConsentDocumentUploadRequest request) {
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
    boolean allowed =
        lowerName.endsWith(".pdf") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx");
    if (!allowed) {
      throw new IllegalArgumentException("Chỉ chấp nhận file pdf, doc, docx");
    }

    if (request.getConfirmed() == null || !request.getConfirmed()) {
      throw new IllegalArgumentException("Bạn phải xác nhận cam kết trước khi lưu");
    }

    if (company.getConsentDocumentFileUrl() != null
        && !company.getConsentDocumentFileUrl().isBlank()) {
      fileUploadService.deleteByUrl(company.getConsentDocumentFileUrl());
    }

    String fileUrl = fileUploadService.uploadConsentDocument(file);

    company.setConsentDocumentFileUrl(fileUrl);

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

    String phone = request.getPhone() == null ? "" : request.getPhone().trim();
    String code = request.getOtpCode() == null ? "" : request.getOtpCode().trim();

    if (phone.isBlank()) throw new IllegalArgumentException("Số điện thoại không được để trống");
    if (code.isBlank()) throw new IllegalArgumentException("Mã OTP không được để trống");

    String key = PHONE_OTP_KEY_PREFIX + accountId;
    OtpCode otp =
        otpCodeRepository
            .findTopByEmailAndIsVerificationOrderByExpiryTimeDesc(key, true)
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        "Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại."));

    if (!otp.getCode().equals(code)) {
      throw new IllegalArgumentException("Mã OTP không chính xác");
    }
    if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
      throw new IllegalArgumentException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");
    }

    company.setPhone(phone);
    company.setLastUpdate(LocalDateTime.now());
    companyRepository.save(company);

    otpCodeRepository.deleteByEmail(key);
    log.info("Phone verified for accountId={}, phone={}", accountId, phone);
  }

  // ==========================================
  // Social Links — lưu dạng JSON 1 cột
  // ==========================================
  private static final com.fasterxml.jackson.databind.ObjectMapper SOCIAL_MAPPER =
      new com.fasterxml.jackson.databind.ObjectMapper();
  private static final int MAX_SOCIAL_LINKS = 10;

  @Override
  @Transactional(readOnly = true)
  public java.util.List<com.iting.jobportal.company.dto.request.CompanySocialLinkDto>
      getMySocialLinks(Long accountId) {
    Company company = getCompanyByAccountId(accountId);
    return parseSocialLinks(company.getSocialLinksJson());
  }

  @Override
  public java.util.List<com.iting.jobportal.company.dto.request.CompanySocialLinkDto>
      updateMySocialLinks(
          Long accountId,
          java.util.List<com.iting.jobportal.company.dto.request.CompanySocialLinkDto> links) {
    Company company = getCompanyByAccountId(accountId);

    java.util.List<com.iting.jobportal.company.dto.request.CompanySocialLinkDto> sanitized =
        new java.util.ArrayList<>();
    if (links != null) {
      if (links.size() > MAX_SOCIAL_LINKS) {
        throw new IllegalArgumentException("Tối đa " + MAX_SOCIAL_LINKS + " liên kết mạng xã hội");
      }
      // Loại bỏ entry rỗng (cho phép user xoá bớt mà không cần delete riêng)
      for (var link : links) {
        if (link == null) continue;
        String platform = link.getPlatform() == null ? "" : link.getPlatform().trim().toUpperCase();
        String url = link.getUrl() == null ? "" : link.getUrl().trim();
        if (platform.isBlank() || url.isBlank()) continue;
        sanitized.add(
            new com.iting.jobportal.company.dto.request.CompanySocialLinkDto(platform, url));
      }
    }

    try {
      company.setSocialLinksJson(
          sanitized.isEmpty() ? null : SOCIAL_MAPPER.writeValueAsString(sanitized));
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      throw new IllegalStateException("Không serialize được social links", e);
    }
    company.setLastUpdate(LocalDateTime.now());
    companyRepository.save(company);
    log.info("Updated social links for accountId={}, count={}", accountId, sanitized.size());

    return sanitized;
  }

  private java.util.List<com.iting.jobportal.company.dto.request.CompanySocialLinkDto>
      parseSocialLinks(String json) {
    if (json == null || json.isBlank()) return new java.util.ArrayList<>();
    try {
      return SOCIAL_MAPPER.readValue(
          json, new com.fasterxml.jackson.core.type.TypeReference<>() {});
    } catch (Exception e) {
      log.warn("Cannot parse social_links JSON: {}", e.getMessage());
      return new java.util.ArrayList<>();
    }
  }

  @Override
  public void sendPhoneOtpByAccountId(Long accountId, String phone) {
    // Đảm bảo HR có affiliation tới company (sẽ throw 403 nếu chưa)
    getCompanyByAccountId(accountId);

    if (phone == null || phone.isBlank()) {
      throw new IllegalArgumentException("Số điện thoại không được để trống");
    }
    String trimmed = phone.trim();

    String code = String.format("%06d", (int) (Math.random() * 1_000_000));
    String key = PHONE_OTP_KEY_PREFIX + accountId;

    otpCodeRepository.deleteByEmail(key);
    OtpCode otp =
        OtpCode.builder()
            .email(key)
            .code(code)
            .expiryTime(LocalDateTime.now().plusMinutes(5))
            .isVerification(true)
            .build();
    otpCodeRepository.save(otp);

    // TODO: Tích hợp SMS gateway (Twilio/eSMS/Speedsms…). Hiện log ra console
    // để dev/test có thể đọc được mã trong môi trường local.
    log.info(
        "[PHONE OTP] accountId={}, phone={}, code={} (expires in 5m)", accountId, trimmed, code);
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

    company.setCompanyReviewStatus(CompanyReviewStatus.PENDING_REVIEW);
    company.setLastUpdateRequestDate(LocalDateTime.now());
    company.setLastUpdate(LocalDateTime.now());

    Company saved = companyRepository.save(company);

    eventPublisher.publishEvent(
        new CompanyInfoSubmittedEvent(this, saved.getId(), saved.getName()));

    return mapToResponse(saved);
  }

  @Override
  public CompanyResponse submitDocumentReview(Long id) {
    return submitDocumentReviewByAccountId(id);
  }

  @Override
  public CompanyResponse submitDocumentReviewByAccountId(Long accountId) {
    Company company = getCompanyByAccountId(accountId);

    if (company.getBusinessLicenseFileUrl() == null
        || company.getBusinessLicenseFileUrl().isBlank()) {
      throw new IllegalArgumentException("Giấy phép kinh doanh không được để trống");
    }

    if (company.getConsentDocumentFileUrl() == null
        || company.getConsentDocumentFileUrl().isBlank()) {
      throw new IllegalArgumentException("Văn bản thỏa thuận dữ liệu cá nhân không được để trống");
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

    if (company.getBusinessLicenseFileUrl() == null
        || company.getBusinessLicenseFileUrl().isBlank()) {
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

    if (company.getConsentDocumentFileUrl() == null
        || company.getConsentDocumentFileUrl().isBlank()) {
      throw new IllegalArgumentException("Bạn chưa tải lên Văn bản thỏa thuận dữ liệu cá nhân");
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
    Long companyId = authz.requireCompanyOf(accountId);
    return companyRepository
        .findById(companyId)
        .orElseThrow(
            () -> new IllegalArgumentException("Không tìm thấy công ty của tài khoản này"));
  }

  // ==========================================
  // Map Company -> CompanyResponse
  // ==========================================
  private CompanyResponse mapToResponse(Company company) {
    CompanyResponse response = companyMapper.toResponse(company);
    response.setActiveJobCount(
        (int) jobRepository.countActiveAndNotExpiredByCompanyId(company.getId()));
    response.setFollowerCount(companyFollowService.getFollowerCount(company.getId()));
    // Set average rating & review count
    Double avgRating = companyReviewRepository.getAverageRating(company.getId());
    response.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null);
    response.setReviewCount(companyReviewRepository.countByCompanyId(company.getId()));
    return response;
  }

  @Override
  public Page<CompanyResponse> searchCompanies(
      String keyword, String location, String industry, String size, int page, int sizePage) {
    Pageable pageable = PageRequest.of(page, sizePage, Sort.by("lastUpdate").descending());

    Specification<Company> spec =
        (root, query, cb) -> {
          List<Predicate> predicates = new ArrayList<>();

          if (keyword != null && !keyword.isBlank()) {
            String kw = "%" + keyword.toLowerCase() + "%";
            predicates.add(
                cb.or(
                    cb.like(cb.lower(root.get("name")), kw),
                    cb.like(cb.lower(root.get("description")), kw)));
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

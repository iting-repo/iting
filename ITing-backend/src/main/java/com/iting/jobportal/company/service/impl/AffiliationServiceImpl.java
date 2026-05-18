package com.iting.jobportal.company.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.admin.service.AdminNotificationService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.dto.request.InitAffiliationRequest;
import com.iting.jobportal.company.dto.request.UpdateAffiliationBasicInfoRequest;
import com.iting.jobportal.company.dto.response.AffiliationMeResponse;
import com.iting.jobportal.company.dto.response.InitAffiliationResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyHrAffiliation;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AffiliationService;
import com.iting.jobportal.file.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AffiliationServiceImpl implements AffiliationService {

    private final CompanyHrAffiliationRepository affiliationRepo;
    private final CompanyRepository companyRepo;
    private final AccountRepository accountRepo;
    private final FileUploadService fileUploadService;
    private final AdminNotificationService adminNotificationService;
    private final ObjectMapper objectMapper;

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

    // ════════════════════════════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public InitAffiliationResponse init(Long hrAccountId, InitAffiliationRequest request) {
        // 1) Block: HR đã có affiliation đang active
        if (affiliationRepo.findActiveByHrAccountId(hrAccountId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "HR đã có affiliation đang active — không thể init thêm");
        }

        Account hr = accountRepo.findById(hrAccountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy HR account"));

        String taxCode = request.getTaxCode().trim();

        // 2) Detect Company existing qua taxCode
        Optional<Company> existing = companyRepo.findByTaxCode(taxCode);

        Company company;
        boolean isFirstHr;

        if (existing.isPresent()) {
            // Join existing
            company = existing.get();
            isFirstHr = false;
        } else {
            // Tạo Company DRAFT mới (chỉ taxCode + status; info detail HR sẽ submit qua updateBasicInfo)
            company = new Company();
            company.setTaxCode(taxCode);
            company.setName("Chưa cập nhật");                       // placeholder
            company.setVerificationLevel(VerificationLevel.UNVERIFIED);
            company.setCompanyReviewStatus(CompanyReviewStatus.DRAFT);
            company.setDocumentReviewStatus(DocumentReviewStatus.MISSING);
            company.setActive(true);
            company.setFollowerCount(0L);
            company.setProfileSetup(false);
            company.setLastUpdate(LocalDateTime.now());
            company = companyRepo.save(company);
            isFirstHr = true;
        }

        // 3) Tạo Affiliation INCOMPLETE — snapshot trống, chờ HR submit qua FoundingInfoTab + Verification
        CompanyHrAffiliation aff = CompanyHrAffiliation.builder()
                .hrAccount(hr)
                .company(company)
                .status(AffiliationStatus.INCOMPLETE)
                .submissionStatus(SubmissionStatus.NONE)
                .requestedAt(LocalDateTime.now())
                .build();
        aff = affiliationRepo.save(aff);

        return InitAffiliationResponse.builder()
                .companyId(company.getId())
                .affiliationId(aff.getId())
                .isFirstHr(isFirstHr)
                .companyName(company.getName())
                .build();
    }

    // ════════════════════════════════════════════════════════════════
    // GET ME
    // ════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public Optional<AffiliationMeResponse> getMe(Long hrAccountId) {
        return affiliationRepo.findActiveByHrAccountId(hrAccountId)
                .map(this::toMeResponse);
    }

    private AffiliationMeResponse toMeResponse(CompanyHrAffiliation aff) {
        Company c = aff.getCompany();
        boolean isInfoSource = c.getInfoSourceAffiliationId() != null
                && c.getInfoSourceAffiliationId().equals(aff.getId());

        return AffiliationMeResponse.builder()
                .affiliationId(aff.getId())
                .companyId(c.getId())
                .companyName(c.getName())
                .companyLogoUrl(c.getLogoUrl())
                .companyTaxCode(c.getTaxCode())
                .infoSource(isInfoSource)
                .status(aff.getStatus())
                .submissionStatus(aff.getSubmissionStatus())
                .submissionRejectReason(aff.getSubmissionRejectReason())
                .submissionSubmittedAt(aff.getSubmissionSubmittedAt())
                .submissionReviewedAt(aff.getSubmissionReviewedAt())
                .appliedToCompanyAt(aff.getAppliedToCompanyAt())
                .submittedName(aff.getSubmittedName())
                .submittedLogoUrl(aff.getSubmittedLogoUrl())
                .submittedDescription(aff.getSubmittedDescription())
                .submittedWebsite(aff.getSubmittedWebsite())
                .submittedAddress(aff.getSubmittedAddress())
                .submittedIndustries(deserializeIndustries(aff.getSubmittedIndustriesJson()))
                .submittedCompanySize(aff.getSubmittedCompanySize())
                .submittedPhone(aff.getSubmittedPhone())
                .submittedCompanyEmail(aff.getSubmittedCompanyEmail())
                .submittedLicenseUrl(aff.getSubmittedLicenseUrl())
                .build();
    }

    // ════════════════════════════════════════════════════════════════
    // UPDATE BASIC INFO (snapshot)
    // ════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public AffiliationMeResponse updateBasicInfo(Long hrAccountId, UpdateAffiliationBasicInfoRequest req) {
        CompanyHrAffiliation aff = requireActiveAffiliation(hrAccountId);

        if (req.getName() != null)            aff.setSubmittedName(req.getName());
        if (req.getLogoUrl() != null)         aff.setSubmittedLogoUrl(req.getLogoUrl());
        if (req.getDescription() != null)     aff.setSubmittedDescription(req.getDescription());
        if (req.getWebsite() != null)         aff.setSubmittedWebsite(req.getWebsite());
        if (req.getAddress() != null)         aff.setSubmittedAddress(req.getAddress());
        if (req.getIndustries() != null)      aff.setSubmittedIndustriesJson(serializeIndustries(req.getIndustries()));
        if (req.getCompanySize() != null)     aff.setSubmittedCompanySize(req.getCompanySize());
        if (req.getPhone() != null)           aff.setSubmittedPhone(req.getPhone());
        if (req.getCompanyEmail() != null)    aff.setSubmittedCompanyEmail(req.getCompanyEmail());

        // Reset submission state: HR đã sửa → chưa submit lại
        aff.setSubmissionStatus(SubmissionStatus.DRAFT);
        aff.setSubmissionRejectReason(null);

        return toMeResponse(affiliationRepo.save(aff));
    }

    // ════════════════════════════════════════════════════════════════
    // UPLOAD LOGO / LICENSE
    // ════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public String uploadLogo(Long hrAccountId, MultipartFile file) {
        CompanyHrAffiliation aff = requireActiveAffiliation(hrAccountId);
        validateImage(file);

        String oldUrl = aff.getSubmittedLogoUrl();
        String newUrl = fileUploadService.uploadLogo(file);
        aff.setSubmittedLogoUrl(newUrl);
        aff.setSubmissionStatus(SubmissionStatus.DRAFT);
        affiliationRepo.save(aff);

        if (oldUrl != null && !oldUrl.isBlank()) {
            try { fileUploadService.deleteByUrl(oldUrl); }
            catch (Exception e) { log.warn("Không xoá được logo cũ: {}", oldUrl, e); }
        }
        return newUrl;
    }

    @Override
    @Transactional
    public String uploadLicense(Long hrAccountId, MultipartFile file) {
        CompanyHrAffiliation aff = requireActiveAffiliation(hrAccountId);
        validatePdfOrImage(file);

        String oldUrl = aff.getSubmittedLicenseUrl();
        String newUrl = fileUploadService.uploadBusinessLicense(file);
        aff.setSubmittedLicenseUrl(newUrl);
        aff.setSubmissionStatus(SubmissionStatus.DRAFT);
        affiliationRepo.save(aff);

        if (oldUrl != null && !oldUrl.isBlank()) {
            try { fileUploadService.deleteByUrl(oldUrl); }
            catch (Exception e) { log.warn("Không xoá được license cũ: {}", oldUrl, e); }
        }
        return newUrl;
    }

    // ════════════════════════════════════════════════════════════════
    // SUBMIT REVIEW
    // ════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public AffiliationMeResponse submitReview(Long hrAccountId) {
        CompanyHrAffiliation aff = requireActiveAffiliation(hrAccountId);

        // Validate snapshot đủ thông tin tối thiểu
        if (isBlank(aff.getSubmittedName()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên công ty không được để trống");
        if (isBlank(aff.getSubmittedCompanyEmail()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email công ty không được để trống");
        if (isBlank(aff.getSubmittedPhone()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại công ty không được để trống");
        if (isBlank(aff.getSubmittedAddress()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Địa chỉ công ty không được để trống");
        if (isBlank(aff.getSubmittedLicenseUrl()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng upload giấy phép kinh doanh trước khi gửi duyệt");

        aff.setSubmissionStatus(SubmissionStatus.PENDING_REVIEW);
        aff.setSubmissionSubmittedAt(LocalDateTime.now());
        aff.setSubmissionRejectReason(null);

        // Lần đầu HR submit: status INCOMPLETE/REJECTED → PENDING (chờ admin duyệt membership).
        // Re-submit (status APPROVED): giữ APPROVED, chỉ submission đi qua review chu kỳ mới.
        if (aff.getStatus() == AffiliationStatus.INCOMPLETE
                || aff.getStatus() == AffiliationStatus.REJECTED) {
            aff.setStatus(AffiliationStatus.PENDING);
        }

        CompanyHrAffiliation saved = affiliationRepo.save(aff);

        // Best-effort notify admin
        try {
            adminNotificationService.notifyNewCompany(saved.getCompany());
        } catch (Exception e) {
            log.warn("Không gửi được thông báo admin về submit affiliation #{}", saved.getId(), e);
        }

        return toMeResponse(saved);
    }

    // ════════════════════════════════════════════════════════════════
    // PRESIGNED URL HELPERS
    // ════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public String getLicensePresignedUrl(Long hrAccountId, int expiryMinutes) {
        CompanyHrAffiliation aff = requireActiveAffiliation(hrAccountId);
        String url = aff.getSubmittedLicenseUrl();
        if (isBlank(url))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa upload giấy phép");
        return fileUploadService.generatePresignedUrl(url, expiryMinutes);
    }

    @Override
    @Transactional(readOnly = true)
    public String getLogoPresignedUrl(Long hrAccountId, int expiryMinutes) {
        CompanyHrAffiliation aff = requireActiveAffiliation(hrAccountId);
        String url = aff.getSubmittedLogoUrl();
        if (isBlank(url))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa upload logo");
        return fileUploadService.generatePresignedUrl(url, expiryMinutes);
    }

    // ════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ════════════════════════════════════════════════════════════════

    private CompanyHrAffiliation requireActiveAffiliation(Long hrAccountId) {
        return affiliationRepo.findActiveByHrAccountId(hrAccountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "HR chưa khởi tạo affiliation — vui lòng gọi POST /api/hr/affiliations/me/init trước"));
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không được để trống");
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File phải là ảnh");
    }

    private void validatePdfOrImage(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không được để trống");
        String ct = file.getContentType();
        if (ct == null || !(ct.equals("application/pdf") || ct.startsWith("image/")))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File phải là PDF hoặc ảnh");
    }

    private String serializeIndustries(List<String> industries) {
        if (industries == null || industries.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(industries);
        } catch (Exception e) {
            log.warn("Không serialize được industries", e);
            return null;
        }
    }

    private List<String> deserializeIndustries(String json) {
        if (isBlank(json)) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, STRING_LIST);
        } catch (Exception e) {
            log.warn("Không parse được industries JSON: {}", json, e);
            return Collections.emptyList();
        }
    }
}

package com.iting.jobportal.company.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.company.dto.response.AdminAffiliationResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.CompanyAuditLog;
import com.iting.jobportal.company.entity.CompanyHrAffiliation;
import com.iting.jobportal.company.entity.enums.AffiliationStatus;
import com.iting.jobportal.company.entity.enums.CompanyAuditAction;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.DocumentReviewStatus;
import com.iting.jobportal.company.entity.enums.Industry;
import com.iting.jobportal.company.entity.enums.SubmissionStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyAuditLogRepository;
import com.iting.jobportal.company.repository.CompanyHrAffiliationRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AdminAffiliationService;
import com.iting.jobportal.file.FileUploadService;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAffiliationServiceImpl implements AdminAffiliationService {

  private final CompanyHrAffiliationRepository affiliationRepo;
  private final CompanyRepository companyRepo;
  private final CompanyAuditLogRepository auditLogRepo;
  private final FileUploadService fileUploadService;
  private final ObjectMapper objectMapper;

  private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

  // ════════════════════════════════════════════════════════════════
  // LIST + DETAIL
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional(readOnly = true)
  public Page<AdminAffiliationResponse> list(
      AffiliationStatus status,
      SubmissionStatus submissionStatus,
      Long companyId,
      Long hrAccountId,
      String hrEmail,
      Pageable pageable) {
    Specification<CompanyHrAffiliation> spec =
        (root, query, cb) -> {
          List<Predicate> predicates = new ArrayList<>();
          if (status != null) predicates.add(cb.equal(root.get("status"), status));
          if (submissionStatus != null)
            predicates.add(cb.equal(root.get("submissionStatus"), submissionStatus));
          if (companyId != null) predicates.add(cb.equal(root.get("company").get("id"), companyId));
          if (hrAccountId != null)
            predicates.add(cb.equal(root.get("hrAccount").get("id"), hrAccountId));
          if (hrEmail != null && !hrEmail.isBlank()) {
            predicates.add(
                cb.like(
                    cb.lower(root.get("hrAccount").get("email")),
                    "%" + hrEmail.trim().toLowerCase() + "%"));
          }
          return cb.and(predicates.toArray(new Predicate[0]));
        };
    return affiliationRepo.findAll(spec, pageable).map(this::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public AdminAffiliationResponse getDetail(Long affiliationId) {
    return toResponse(findOrThrow(affiliationId));
  }

  @Override
  @Transactional(readOnly = true)
  public String getLicensePresignedUrl(Long affiliationId, int expiryMinutes) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    String url = aff.getSubmittedLicenseUrl();
    if (url == null || url.isBlank())
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HR chưa upload giấy phép");
    return fileUploadService.generatePresignedUrl(url, expiryMinutes);
  }

  @Override
  @Transactional(readOnly = true)
  public String getLogoPresignedUrl(Long affiliationId, int expiryMinutes) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    String url = aff.getSubmittedLogoUrl();
    if (url == null || url.isBlank())
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HR chưa upload logo");
    return fileUploadService.generatePresignedUrl(url, expiryMinutes);
  }

  @Override
  @Transactional(readOnly = true)
  public String getConsentPresignedUrl(Long affiliationId, int expiryMinutes) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    String url = aff.getSubmittedConsentUrl();
    if (url == null || url.isBlank())
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "HR chưa upload văn bản thỏa thuận");
    return fileUploadService.generatePresignedUrl(url, expiryMinutes);
  }

  // ════════════════════════════════════════════════════════════════
  // APPROVE
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public AdminAffiliationResponse approve(Long affiliationId, Long adminAccountId) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);

    if (aff.getSubmissionStatus() != SubmissionStatus.PENDING_REVIEW) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Submission không ở trạng thái PENDING_REVIEW (hiện: " + aff.getSubmissionStatus() + ")");
    }

    boolean firstApproval = aff.getStatus() != AffiliationStatus.APPROVED;

    // 1) Submission APPROVED
    aff.setSubmissionStatus(SubmissionStatus.APPROVED);
    aff.setSubmissionReviewedAt(LocalDateTime.now());
    aff.setSubmissionReviewedBy(adminAccountId);
    aff.setSubmissionRejectReason(null);

    // 2) Membership APPROVED (nếu lần đầu)
    if (firstApproval) {
      aff.setStatus(AffiliationStatus.APPROVED);
      aff.setReviewedAt(LocalDateTime.now());
      aff.setReviewedBy(adminAccountId);
    }

    // 3) Auto-apply snapshot lên Company nếu đây là affiliation đầu tiên APPROVED của Company
    Company company = aff.getCompany();
    long approvedCount =
        affiliationRepo.countByCompany_IdAndStatus(company.getId(), AffiliationStatus.APPROVED);
    boolean isFirstApprovedOfCompany = firstApproval && approvedCount == 1;

    if (isFirstApprovedOfCompany) {
      applySnapshotToCompany(aff, company);
      aff.setAppliedToCompanyAt(LocalDateTime.now());
      company.setInfoSourceAffiliationId(aff.getId());
      company.setCompanyReviewStatus(CompanyReviewStatus.APPROVED);
      company.setDocumentReviewStatus(DocumentReviewStatus.APPROVED);
      companyRepo.save(company);

      recordAudit(
          company,
          CompanyAuditAction.APPROVE,
          adminAccountId,
          "Auto-apply snapshot từ affiliation đầu tiên APPROVED #" + aff.getId(),
          null,
          "APPROVED");
    }

    return toResponse(affiliationRepo.save(aff));
  }

  // ════════════════════════════════════════════════════════════════
  // REJECT
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public AdminAffiliationResponse reject(Long affiliationId, Long adminAccountId, String reason) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);

    aff.setSubmissionStatus(SubmissionStatus.REJECTED);
    aff.setSubmissionRejectReason(reason);
    aff.setSubmissionReviewedAt(LocalDateTime.now());
    aff.setSubmissionReviewedBy(adminAccountId);

    // Nếu lần đầu (PENDING) → membership cũng REJECTED.
    // Re-submit case (đã APPROVED): membership giữ APPROVED, chỉ submission REJECTED.
    if (aff.getStatus() == AffiliationStatus.PENDING) {
      aff.setStatus(AffiliationStatus.REJECTED);
      aff.setRejectedReason(reason);
    }

    return toResponse(affiliationRepo.save(aff));
  }

  // ════════════════════════════════════════════════════════════════
  // DUYỆT / TỪ CHỐI TỪNG PHẦN + GÁN CÔNG TY (V120)
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public AdminAffiliationResponse approvePart(
      Long affiliationId, String part, Long adminAccountId) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    switch (normalizePart(part)) {
      case "info" -> {
        aff.setInfoStatus(SubmissionStatus.APPROVED);
        aff.setInfoRejectReason(null);
      }
      case "license" -> {
        aff.setLicenseStatus(SubmissionStatus.APPROVED);
        aff.setLicenseRejectReason(null);
      }
      case "consent" -> {
        aff.setConsentStatus(SubmissionStatus.APPROVED);
        aff.setConsentRejectReason(null);
      }
      default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần không hợp lệ");
    }

    // Duyệt đủ 3 phần KHÔNG tự gán/xác thực công ty. Việc gán HR vào công ty (và qua đó
    // xác thực công ty) phải do admin chủ động thực hiện qua "Gán vào công ty"
    // (assignToCompany) — tránh tự động gán theo công ty dò được lúc init theo MST.
    return toResponse(affiliationRepo.save(aff));
  }

  @Override
  @Transactional
  public AdminAffiliationResponse rejectPart(
      Long affiliationId, String part, Long adminAccountId, String reason) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    switch (normalizePart(part)) {
      case "info" -> {
        aff.setInfoStatus(SubmissionStatus.REJECTED);
        aff.setInfoRejectReason(reason);
      }
      case "license" -> {
        aff.setLicenseStatus(SubmissionStatus.REJECTED);
        aff.setLicenseRejectReason(reason);
      }
      case "consent" -> {
        aff.setConsentStatus(SubmissionStatus.REJECTED);
        aff.setConsentRejectReason(reason);
      }
      default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần không hợp lệ");
    }
    return toResponse(affiliationRepo.save(aff));
  }

  @Override
  @Transactional
  public AdminAffiliationResponse assignToCompany(
      Long affiliationId, Long companyId, Long adminAccountId) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);

    boolean allApproved =
        aff.getInfoStatus() == SubmissionStatus.APPROVED
            && aff.getLicenseStatus() == SubmissionStatus.APPROVED
            && aff.getConsentStatus() == SubmissionStatus.APPROVED;
    if (!allApproved) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Cần duyệt đủ cả 3 phần (thông tin + giấy phép + thỏa thuận) trước khi gán công ty");
    }

    Company target =
        companyRepo
            .findById(companyId)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy công ty #" + companyId));

    LocalDateTime now = LocalDateTime.now();

    // Gán HR vào công ty được chọn (ghi đè company_id) + duyệt membership/submission.
    aff.setCompany(target);
    aff.setStatus(AffiliationStatus.APPROVED);
    aff.setReviewedAt(now);
    aff.setReviewedBy(adminAccountId);
    aff.setSubmissionStatus(SubmissionStatus.APPROVED);
    aff.setSubmissionReviewedAt(now);
    aff.setSubmissionReviewedBy(adminAccountId);
    aff.setSubmissionRejectReason(null);

    // Apply snapshot HR lên công ty được chọn → thông tin hiển thị đúng dữ liệu HR xác thực.
    applySnapshotToCompany(aff, target);
    aff.setAppliedToCompanyAt(now);
    if (target.getInfoSourceAffiliationId() == null) {
      target.setInfoSourceAffiliationId(aff.getId());
    }
    target.setCompanyReviewStatus(CompanyReviewStatus.APPROVED);
    target.setDocumentReviewStatus(DocumentReviewStatus.APPROVED);
    if (target.getVerificationLevel() == null
        || target.getVerificationLevel().getValue() < VerificationLevel.ADVANCED.getValue()) {
      target.setVerificationLevel(VerificationLevel.ADVANCED);
    }
    target.setActive(true);
    companyRepo.save(target);

    recordAudit(
        target,
        CompanyAuditAction.APPROVE,
        adminAccountId,
        "Gán HR account #" + aff.getHrAccount().getId() + " vào công ty (assign-to-company)",
        null,
        "APPROVED");

    return toResponse(affiliationRepo.save(aff));
  }

  private String normalizePart(String part) {
    return part == null ? "" : part.trim().toLowerCase();
  }

  // ════════════════════════════════════════════════════════════════
  // APPLY-TO-COMPANY (luồng tổng đài)
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public AdminAffiliationResponse applyToCompany(
      Long affiliationId, Long adminAccountId, String verifiedHrEmail, String contactNote) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    if (aff.getSubmissionStatus() != SubmissionStatus.APPROVED) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Submission chưa được duyệt (hiện: "
              + aff.getSubmissionStatus()
              + ") — không thể áp lên Company");
    }
    if (aff.getStatus() != AffiliationStatus.APPROVED) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Affiliation chưa được duyệt (hiện: " + aff.getStatus() + ")");
    }

    Company company = aff.getCompany();
    applySnapshotToCompany(aff, company);
    aff.setAppliedToCompanyAt(LocalDateTime.now());
    company.setInfoSourceAffiliationId(aff.getId());
    companyRepo.save(company);
    affiliationRepo.save(aff);

    String note = "Hotline call from HR " + safe(verifiedHrEmail);
    if (contactNote != null && !contactNote.isBlank()) {
      note += " | " + contactNote;
    }
    recordAudit(
        company,
        CompanyAuditAction.APPROVE,
        adminAccountId,
        "Direct info update via hotline (apply snapshot từ affiliation #" + aff.getId() + ")",
        note,
        null);

    return toResponse(aff);
  }

  // ════════════════════════════════════════════════════════════════
  // REVOKE
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public AdminAffiliationResponse revoke(Long affiliationId, Long adminAccountId, String reason) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    if (aff.getStatus() != AffiliationStatus.APPROVED) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Chỉ revoke được affiliation đang APPROVED (hiện: " + aff.getStatus() + ")");
    }

    aff.setStatus(AffiliationStatus.REVOKED);
    aff.setRejectedReason(reason);
    aff.setReviewedAt(LocalDateTime.now());
    aff.setReviewedBy(adminAccountId);

    // Nếu affiliation này đang là info source → giữ nguyên Company info nhưng clear pointer
    // (admin có thể manual reassign sau).
    Company company = aff.getCompany();
    if (aff.getId().equals(company.getInfoSourceAffiliationId())) {
      company.setInfoSourceAffiliationId(null);
      companyRepo.save(company);
    }

    return toResponse(affiliationRepo.save(aff));
  }

  @Override
  @Transactional
  public AdminAffiliationResponse restoreRevoked(Long affiliationId, Long adminAccountId) {
    CompanyHrAffiliation aff = findOrThrow(affiliationId);
    if (aff.getStatus() != AffiliationStatus.REVOKED) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Chỉ hoàn được đơn đang ở trạng thái Đã thu hồi (hiện: " + aff.getStatus() + ")");
    }

    aff.setStatus(AffiliationStatus.APPROVED);
    aff.setRejectedReason(null);
    aff.setReviewedAt(LocalDateTime.now());
    aff.setReviewedBy(adminAccountId);

    // Khôi phục con trỏ info source + áp lại snapshot nếu công ty hiện chưa có nguồn thông tin
    // (revoke đã clear pointer; lúc thu hồi không đổi thông tin công ty nên áp lại an toàn).
    Company company = aff.getCompany();
    if (company != null && company.getInfoSourceAffiliationId() == null) {
      company.setInfoSourceAffiliationId(aff.getId());
      applySnapshotToCompany(aff, company);
      aff.setAppliedToCompanyAt(LocalDateTime.now());
      companyRepo.save(company);
    }

    if (company != null) {
      recordAudit(
          company,
          CompanyAuditAction.APPROVE,
          adminAccountId,
          "Hoàn thu hồi xác thực (affiliation #" + aff.getId() + ")",
          null,
          "APPROVED");
    }

    return toResponse(affiliationRepo.save(aff));
  }

  // ════════════════════════════════════════════════════════════════
  // INTERNAL
  // ════════════════════════════════════════════════════════════════

  /**
   * Áp toàn bộ snapshot của affiliation lên Company entity. Industries: parse JSON list<String> →
   * enum Industry (skip giá trị không khớp enum).
   */
  private void applySnapshotToCompany(CompanyHrAffiliation aff, Company company) {
    if (aff.getSubmittedName() != null) company.setName(aff.getSubmittedName());
    if (aff.getSubmittedLogoUrl() != null) company.setLogoUrl(aff.getSubmittedLogoUrl());
    if (aff.getSubmittedDescription() != null)
      company.setDescription(aff.getSubmittedDescription());
    if (aff.getSubmittedWebsite() != null) company.setWebsite(aff.getSubmittedWebsite());
    if (aff.getSubmittedAddress() != null) company.setAddress(aff.getSubmittedAddress());
    if (aff.getSubmittedCompanySize() != null)
      company.setCompanySize(aff.getSubmittedCompanySize());
    if (aff.getSubmittedPhone() != null) company.setPhone(aff.getSubmittedPhone());
    if (aff.getSubmittedCompanyEmail() != null)
      company.setCompanyEmail(aff.getSubmittedCompanyEmail());
    if (aff.getSubmittedLicenseUrl() != null)
      company.setBusinessLicenseFileUrl(aff.getSubmittedLicenseUrl());
    if (aff.getSubmittedConsentUrl() != null)
      company.setConsentDocumentFileUrl(aff.getSubmittedConsentUrl());

    if (aff.getSubmittedIndustriesJson() != null) {
      List<String> names = parseIndustryNames(aff.getSubmittedIndustriesJson());
      List<Industry> industries = new ArrayList<>();
      for (String n : names) {
        try {
          industries.add(Industry.valueOf(n));
        } catch (IllegalArgumentException e) {
          log.warn("Skip industry không hợp lệ: {}", n);
        }
      }
      if (!industries.isEmpty()) company.setIndustries(industries);
    }
    company.setLastUpdate(LocalDateTime.now());
  }

  private List<String> parseIndustryNames(String json) {
    try {
      return objectMapper.readValue(json, STRING_LIST);
    } catch (Exception e) {
      log.warn("Không parse được submitted_industries: {}", json, e);
      return Collections.emptyList();
    }
  }

  private void recordAudit(
      Company company,
      CompanyAuditAction action,
      Long adminId,
      String reason,
      String note,
      String toStatus) {
    CompanyAuditLog log =
        CompanyAuditLog.builder()
            .company(company)
            .action(action)
            .toStatus(toStatus)
            .reason(reason)
            .note(note)
            .actor("admin#" + adminId)
            .actorId(adminId)
            .createdAt(LocalDateTime.now())
            .build();
    auditLogRepo.save(log);
  }

  private CompanyHrAffiliation findOrThrow(Long affiliationId) {
    return affiliationRepo
        .findById(affiliationId)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Không tìm thấy affiliation #" + affiliationId));
  }

  private static String safe(String s) {
    return s == null ? "" : s;
  }

  private AdminAffiliationResponse toResponse(CompanyHrAffiliation aff) {
    Account hr = aff.getHrAccount();
    Company c = aff.getCompany();
    boolean isInfoSource =
        c.getInfoSourceAffiliationId() != null
            && c.getInfoSourceAffiliationId().equals(aff.getId());

    // Generate fresh presigned URLs (best-effort — không fail toàn response nếu S3 error)
    String licensePreview = safePreview(aff.getSubmittedLicenseUrl());
    String consentPreview = safePreview(aff.getSubmittedConsentUrl());
    String logoPreview = safePreview(aff.getSubmittedLogoUrl());

    boolean hasLicense =
        aff.getSubmittedLicenseUrl() != null && !aff.getSubmittedLicenseUrl().isBlank();
    boolean hasConsent =
        aff.getSubmittedConsentUrl() != null && !aff.getSubmittedConsentUrl().isBlank();
    boolean docsComplete =
        hasLicense && hasConsent && Boolean.TRUE.equals(aff.getSubmittedConsentConfirmed());

    return AdminAffiliationResponse.builder()
        .id(aff.getId())
        .hrAccountId(hr.getId())
        .hrEmail(hr.getEmail())
        .hrFullName(hr.getFullName())
        .companyId(c.getId())
        .companyName(c.getName())
        .companyTaxCode(c.getTaxCode())
        .companyLogoUrl(c.getLogoUrl())
        .isInfoSource(isInfoSource)
        .status(aff.getStatus())
        .submissionStatus(aff.getSubmissionStatus())
        .submissionRejectReason(aff.getSubmissionRejectReason())
        .rejectedReason(aff.getRejectedReason())
        .requestedAt(aff.getRequestedAt())
        .submissionSubmittedAt(aff.getSubmissionSubmittedAt())
        .submissionReviewedAt(aff.getSubmissionReviewedAt())
        .submissionReviewedBy(aff.getSubmissionReviewedBy())
        .reviewedAt(aff.getReviewedAt())
        .reviewedBy(aff.getReviewedBy())
        .appliedToCompanyAt(aff.getAppliedToCompanyAt())
        .submittedName(aff.getSubmittedName())
        .submittedLogoUrl(aff.getSubmittedLogoUrl())
        .submittedDescription(aff.getSubmittedDescription())
        .submittedWebsite(aff.getSubmittedWebsite())
        .submittedAddress(aff.getSubmittedAddress())
        .submittedIndustries(parseIndustryNames(aff.getSubmittedIndustriesJson()))
        .submittedCompanySize(aff.getSubmittedCompanySize())
        .submittedPhone(aff.getSubmittedPhone())
        .submittedCompanyEmail(aff.getSubmittedCompanyEmail())
        .submittedLicenseUrl(aff.getSubmittedLicenseUrl())
        .submittedConsentUrl(aff.getSubmittedConsentUrl())
        .submittedConsentConfirmed(aff.getSubmittedConsentConfirmed())
        .licensePreviewUrl(licensePreview)
        .consentPreviewUrl(consentPreview)
        .logoPreviewUrl(logoPreview)
        .hasLicense(hasLicense)
        .hasConsent(hasConsent)
        .documentsComplete(docsComplete)
        .infoStatus(aff.getInfoStatus())
        .licenseStatus(aff.getLicenseStatus())
        .consentStatus(aff.getConsentStatus())
        .infoRejectReason(aff.getInfoRejectReason())
        .licenseRejectReason(aff.getLicenseRejectReason())
        .consentRejectReason(aff.getConsentRejectReason())
        .allPartsApproved(
            aff.getInfoStatus() == SubmissionStatus.APPROVED
                && aff.getLicenseStatus() == SubmissionStatus.APPROVED
                && aff.getConsentStatus() == SubmissionStatus.APPROVED)
        .build();
  }

  /** Generate presigned URL an toàn — return null nếu input blank hoặc S3 lỗi. */
  private String safePreview(String s3KeyOrUrl) {
    if (s3KeyOrUrl == null || s3KeyOrUrl.isBlank()) return null;
    try {
      return fileUploadService.generatePresignedUrl(s3KeyOrUrl, 15);
    } catch (Exception e) {
      return null;
    }
  }
}

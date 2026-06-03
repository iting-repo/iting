package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.request.CreateOfferRequest;
import com.iting.jobportal.application.dto.request.DeclineOfferRequest;
import com.iting.jobportal.application.dto.response.OfferResponse;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.OfferLetter;
import com.iting.jobportal.application.entity.enums.OfferStatus;
import com.iting.jobportal.application.repository.CandidateApplicationRepository;
import com.iting.jobportal.application.repository.OfferLetterRepository;
import com.iting.jobportal.application.service.OfferPdfService;
import com.iting.jobportal.application.service.OfferService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferServiceImpl implements OfferService {

  private static final DateTimeFormatter D_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

  private final OfferLetterRepository offerRepo;
  private final CandidateApplicationRepository applicationRepo;
  private final JobRepository jobRepo;
  private final AccountRepository accountRepo;
  private final AuthorizationService authorizationService;
  private final OfferPdfService offerPdfService;
  private final FileUploadService fileUploadService;
  private final EmailService emailService;
  private final NotificationService notificationService;

  // ════════════════════════════════════════════════════════════════
  // CREATE
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public OfferResponse create(Long hrAccountId, CreateOfferRequest req) {
    Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrAccountId);

    // Verify HR sở hữu job
    Job job =
        jobRepo
            .findById(req.getJobId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
    if (job.getCompany() == null || !hrCompanyId.equals(job.getCompany().getId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Không có quyền tạo offer cho job này");
    }

    // Verify application thuộc job
    ApplyFormSentToJob.ApplyFormSentToJobId pk =
        new ApplyFormSentToJob.ApplyFormSentToJobId(req.getJobId(), req.getApplyFormId());
    ApplyFormSentToJob app =
        applicationRepo
            .findById(pk)
            .orElseThrow(
                () ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Application không tồn tại"));

    // Chặn nếu đã có offer SENT đang active (unique partial index cũng sẽ chặn ở DB layer)
    offerRepo
        .findFirstByApplyFormIdAndJobIdAndStatus(
            req.getApplyFormId(), req.getJobId(), OfferStatus.SENT)
        .ifPresent(
            existing -> {
              throw new ResponseStatusException(
                  HttpStatus.CONFLICT,
                  "Application này đã có offer đang chờ phản hồi (#" + existing.getId() + ")");
            });

    Account candidate =
        accountRepo
            .findById(app.getUserId())
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy candidate account"));

    // Build offer
    OfferLetter offer =
        OfferLetter.builder()
            .applyFormId(req.getApplyFormId())
            .jobId(req.getJobId())
            .candidateAccountId(candidate.getId())
            .companyId(hrCompanyId)
            .createdByHrId(hrAccountId)
            .position(req.getPosition())
            .salaryAmount(req.getSalaryAmount())
            .salaryCurrency(req.getSalaryCurrency() != null ? req.getSalaryCurrency() : "VND")
            .salaryType(req.getSalaryType() != null ? req.getSalaryType() : "MONTH")
            .startDate(req.getStartDate())
            .expiresAt(req.getExpiresAt())
            .notes(req.getNotes())
            .status(OfferStatus.SENT)
            .sentAt(LocalDateTime.now())
            .build();
    offer = offerRepo.save(offer);

    // Generate PDF + upload S3
    try {
      byte[] pdfBytes =
          offerPdfService.generate(
              offer,
              candidate.getFullName(),
              job.getCompany() != null ? job.getCompany().getName() : null,
              job.getCompany() != null ? job.getCompany().getAddress() : null,
              job.getTitle());
      String key = "offers/offer-" + offer.getId() + "-" + UUID.randomUUID() + ".pdf";
      String url = fileUploadService.uploadBytes(pdfBytes, key, "application/pdf");
      offer.setPdfFileUrl(url);
      offerRepo.save(offer);
    } catch (Exception e) {
      log.error("Failed to generate/upload offer PDF (offer #{})", offer.getId(), e);
      // không rollback — offer đã tạo, PDF có thể regenerate sau
    }

    // Auto-move pipeline sang OFFER (nếu chưa)
    if (!"OFFER".equals(app.getPipelineStage()) && !"HIRED".equals(app.getPipelineStage())) {
      app.setPipelineStage("OFFER");
      app.setStageUpdatedAt(LocalDateTime.now());
      app.setStageUpdatedBy(hrAccountId);
      applicationRepo.save(app);
    }

    // Notifications + email (best-effort)
    notifyOfferSent(offer, candidate, job);

    return OfferResponse.fromEntity(offer);
  }

  private void notifyOfferSent(OfferLetter offer, Account candidate, Job job) {
    String companyName =
        (job.getCompany() != null && job.getCompany().getName() != null)
            ? job.getCompany().getName()
            : "Nhà tuyển dụng";
    String jobTitle = job.getTitle() != null ? job.getTitle() : "vị trí";

    try {
      notificationService.createNotification(
          CreateNotificationRequest.builder()
              .recipientId(candidate.getId())
              .recipientType(RecipientType.USER)
              .type(NotificationType.OFFER_SENT)
              .content(
                  String.format(
                      "%s đã gửi offer cho bạn cho vị trí \"%s\". Vui lòng phản hồi trước %s.",
                      companyName, jobTitle, offer.getExpiresAt().toLocalDate().format(D_FMT)))
              .entityType("OFFER")
              .entityId(offer.getId())
              .actionUrl("/candidate/offers")
              .build());
    } catch (Exception e) {
      log.warn("Failed to create in-app notification for offer #{}", offer.getId(), e);
    }

    if (candidate.getEmail() != null) {
      try {
        String subject = "[" + companyName + "] Thư mời nhận việc — " + jobTitle;
        String body =
            String.format(
                "Xin chào %s,%n%n"
                    + "%s đã gửi thư mời nhận việc cho bạn cho vị trí \"%s\".%n"
                    + "Hạn phản hồi: %s%n%n"
                    + "Vui lòng đăng nhập ITing để xem chi tiết và phản hồi: %s%n%n"
                    + "Trân trọng,%nITing",
                candidate.getFullName() != null ? candidate.getFullName() : "bạn",
                companyName,
                jobTitle,
                offer.getExpiresAt().toLocalDate().format(D_FMT),
                "/candidate/offers");
        emailService.sendEmail(candidate.getEmail(), subject, body);
      } catch (Exception e) {
        log.warn("Failed to send offer email for offer #{}", offer.getId(), e);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  // REVOKE
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public OfferResponse revoke(Long hrAccountId, Long offerId) {
    OfferLetter offer =
        offerRepo
            .findById(offerId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer không tồn tại"));
    requireHrCanModify(offer, hrAccountId);

    if (offer.getStatus() != OfferStatus.SENT) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Chỉ có thể revoke offer đang SENT (hiện: " + offer.getStatus() + ")");
    }

    offer.setStatus(OfferStatus.REVOKED);
    offer.setRevokedAt(LocalDateTime.now());
    offerRepo.save(offer);

    notifyCandidate(
        offer,
        NotificationType.OFFER_REVOKED,
        "Offer cho vị trí \"" + offer.getPosition() + "\" đã bị thu hồi.");

    return OfferResponse.fromEntity(offer);
  }

  // ════════════════════════════════════════════════════════════════
  // ACCEPT / DECLINE
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public OfferResponse acceptByCandidate(Long candidateAccountId, Long offerId) {
    OfferLetter offer = requireCandidateOwnsOffer(offerId, candidateAccountId);
    requireOfferIsActive(offer);

    offer.setStatus(OfferStatus.ACCEPTED);
    offer.setRespondedAt(LocalDateTime.now());
    offerRepo.save(offer);

    // Auto-move pipeline sang HIRED
    ApplyFormSentToJob.ApplyFormSentToJobId pk =
        new ApplyFormSentToJob.ApplyFormSentToJobId(offer.getJobId(), offer.getApplyFormId());
    applicationRepo
        .findById(pk)
        .ifPresent(
            app -> {
              app.setPipelineStage("HIRED");
              app.setStageUpdatedAt(LocalDateTime.now());
              app.setStageUpdatedBy(candidateAccountId);
              applicationRepo.save(app);
            });

    notifyHrOwner(
        offer,
        NotificationType.OFFER_ACCEPTED,
        "Ứng viên đã chấp nhận offer #"
            + offer.getId()
            + " cho vị trí \""
            + offer.getPosition()
            + "\".");

    return OfferResponse.fromEntity(offer);
  }

  @Override
  @Transactional
  public OfferResponse declineByCandidate(
      Long candidateAccountId, Long offerId, DeclineOfferRequest body) {
    OfferLetter offer = requireCandidateOwnsOffer(offerId, candidateAccountId);
    requireOfferIsActive(offer);

    offer.setStatus(OfferStatus.DECLINED);
    offer.setRespondedAt(LocalDateTime.now());
    if (body != null && body.getReason() != null) {
      offer.setCandidateResponseNote(body.getReason());
    }
    offerRepo.save(offer);

    notifyHrOwner(
        offer,
        NotificationType.OFFER_DECLINED,
        "Ứng viên đã từ chối offer #"
            + offer.getId()
            + " cho vị trí \""
            + offer.getPosition()
            + "\".");

    return OfferResponse.fromEntity(offer);
  }

  // ════════════════════════════════════════════════════════════════
  // LIST + GET
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional(readOnly = true)
  public List<OfferResponse> listByApplication(Long hrAccountId, Long applyFormId, Long jobId) {
    Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrAccountId);
    Job job =
        jobRepo
            .findById(jobId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
    if (job.getCompany() == null || !hrCompanyId.equals(job.getCompany().getId())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Không có quyền xem offer của application này");
    }
    return offerRepo.findByApplyFormIdAndJobIdOrderByCreatedAtDesc(applyFormId, jobId).stream()
        .map(OfferResponse::fromEntity)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<OfferResponse> listMyOffers(Long candidateAccountId) {
    return offerRepo.findByCandidateAccountIdOrderByCreatedAtDesc(candidateAccountId).stream()
        .map(this::enrichForCandidate)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public OfferResponse getById(Long accountId, Long offerId, boolean asHr) {
    OfferLetter offer =
        offerRepo
            .findById(offerId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer không tồn tại"));
    if (asHr) {
      requireHrCanView(offer, accountId);
      return OfferResponse.fromEntity(offer);
    } else {
      if (!offer.getCandidateAccountId().equals(accountId)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Offer này không thuộc về bạn");
      }
      return enrichForCandidate(offer);
    }
  }

  @Override
  @Transactional(readOnly = true)
  public String getPdfPresignedUrl(Long accountId, Long offerId, boolean asHr) {
    OfferLetter offer =
        offerRepo
            .findById(offerId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer không tồn tại"));
    if (asHr) requireHrCanView(offer, accountId);
    else if (!offer.getCandidateAccountId().equals(accountId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Offer này không thuộc về bạn");
    }
    if (offer.getPdfFileUrl() == null || offer.getPdfFileUrl().isBlank()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer chưa có file PDF");
    }
    return fileUploadService.generatePresignedUrl(offer.getPdfFileUrl(), 15);
  }

  // ════════════════════════════════════════════════════════════════
  // EXPIRE OVERDUE
  // ════════════════════════════════════════════════════════════════

  @Override
  @Transactional
  public int expireOverdueOffers() {
    LocalDateTime now = LocalDateTime.now();
    List<OfferLetter> overdue = offerRepo.findByStatusAndExpiresAtBefore(OfferStatus.SENT, now);
    for (OfferLetter o : overdue) {
      o.setStatus(OfferStatus.EXPIRED);
      o.setRespondedAt(null);
      offerRepo.save(o);

      // Notify cả 2 phía
      notifyCandidate(
          o,
          NotificationType.OFFER_EXPIRED,
          "Offer cho vị trí \"" + o.getPosition() + "\" đã hết hạn.");
      notifyHrOwner(
          o,
          NotificationType.OFFER_EXPIRED,
          "Offer #"
              + o.getId()
              + " (vị trí \""
              + o.getPosition()
              + "\") đã hết hạn mà chưa được phản hồi.");
    }
    if (!overdue.isEmpty()) log.info("Expired {} offers", overdue.size());
    return overdue.size();
  }

  // ════════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════════

  private void requireHrCanModify(OfferLetter offer, Long hrAccountId) {
    if (offer.getCreatedByHrId().equals(hrAccountId)) return;
    // Admin company override: HR khác cùng company có quyền nếu là info_source
    Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrAccountId);
    if (offer.getCompanyId().equals(hrCompanyId)) {
      // Cho phép nếu HR thuộc cùng company (đơn giản hoá — chấp nhận mọi HR approved của company)
      return;
    }
    throw new ResponseStatusException(
        HttpStatus.FORBIDDEN, "Chỉ HR chủ offer hoặc admin company mới được thao tác");
  }

  private void requireHrCanView(OfferLetter offer, Long hrAccountId) {
    Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrAccountId);
    if (!offer.getCompanyId().equals(hrCompanyId)) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Offer này không thuộc company của bạn");
    }
  }

  private OfferLetter requireCandidateOwnsOffer(Long offerId, Long candidateAccountId) {
    OfferLetter offer =
        offerRepo
            .findById(offerId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer không tồn tại"));
    if (!offer.getCandidateAccountId().equals(candidateAccountId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Offer này không thuộc về bạn");
    }
    return offer;
  }

  private void requireOfferIsActive(OfferLetter offer) {
    if (offer.getStatus() != OfferStatus.SENT) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Offer hiện không thể phản hồi (trạng thái: " + offer.getStatus() + ")");
    }
    if (offer.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Offer đã quá hạn phản hồi");
    }
  }

  private void notifyCandidate(OfferLetter offer, NotificationType type, String content) {
    try {
      notificationService.createNotification(
          CreateNotificationRequest.builder()
              .recipientId(offer.getCandidateAccountId())
              .recipientType(RecipientType.USER)
              .type(type)
              .content(content)
              .entityType("OFFER")
              .entityId(offer.getId())
              .actionUrl("/candidate/offers")
              .build());
    } catch (Exception e) {
      log.warn("Failed to notify candidate for offer #{}", offer.getId(), e);
    }
    Optional<Account> opt = accountRepo.findById(offer.getCandidateAccountId());
    opt.ifPresent(
        acc -> {
          if (acc.getEmail() != null) {
            try {
              emailService.sendEmail(acc.getEmail(), "[ITing] " + content, content);
            } catch (Exception e) {
              log.warn("Failed to email candidate for offer #{}", offer.getId(), e);
            }
          }
        });
  }

  private void notifyHrOwner(OfferLetter offer, NotificationType type, String content) {
    try {
      notificationService.createNotification(
          CreateNotificationRequest.builder()
              .recipientId(offer.getCreatedByHrId())
              .recipientType(RecipientType.USER)
              .type(type)
              .content(content)
              .entityType("OFFER")
              .entityId(offer.getId())
              .actionUrl("/employer/manage-applications")
              .build());
    } catch (Exception e) {
      log.warn("Failed to notify HR for offer #{}", offer.getId(), e);
    }
    Optional<Account> opt = accountRepo.findById(offer.getCreatedByHrId());
    opt.ifPresent(
        acc -> {
          if (acc.getEmail() != null) {
            try {
              emailService.sendEmail(acc.getEmail(), "[ITing] " + content, content);
            } catch (Exception e) {
              log.warn("Failed to email HR for offer #{}", offer.getId(), e);
            }
          }
        });
  }

  private OfferResponse enrichForCandidate(OfferLetter o) {
    OfferResponse r = OfferResponse.fromEntity(o);
    jobRepo
        .findById(o.getJobId())
        .ifPresent(
            job -> {
              r.setJobTitle(job.getTitle());
              if (job.getCompany() != null) {
                r.setCompanyName(job.getCompany().getName());
                r.setCompanyLogo(job.getCompany().getLogoUrl());
              }
            });
    return r;
  }
}

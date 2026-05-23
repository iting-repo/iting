package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.entity.ApplicationStageHistory;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.HrEmailTemplate;
import com.iting.jobportal.application.repository.CandidateApplicationRepository;
import com.iting.jobportal.application.repository.HrEmailTemplateRepository;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.auth.security.JwtTokenUtil;
import com.iting.jobportal.common.service.EmailService;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

/**
 * HR hiring pipeline endpoints.
 *
 * <p>5-stage workflow: SCREENING → PHONE_SCREEN → INTERVIEW → OFFER → HIRED (+ REJECTED at any point).
 *
 * <p>Move stage → records history + (optionally) sends templated email to candidate.
 *
 * <ul>
 *   <li>GET  /api/hr/pipeline/stages                                        — list valid stages</li>
 *   <li>GET  /api/hr/pipeline/jobs/{jobId}                                  — applications grouped by stage</li>
 *   <li>POST /api/hr/pipeline/applications/{applyFormId}/{jobId}/move       — move stage + send email</li>
 *   <li>GET  /api/hr/pipeline/templates                                     — email templates</li>
 *   <li>POST /api/hr/pipeline/templates                                     — create custom template</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/hr/pipeline")
@RequiredArgsConstructor
@Slf4j
public class HrPipelineController {

    private static final List<String> VALID_STAGES = List.of(
            "SCREENING", "PHONE_SCREEN", "INTERVIEW", "OFFER", "HIRED", "REJECTED");

    @PersistenceContext
    private EntityManager em;

    private final CandidateApplicationRepository applicationRepository;
    private final HrEmailTemplateRepository templateRepository;
    private final JobRepository jobRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;
    private final AuthorizationService authorizationService;
    private final JwtTokenUtil jwtTokenUtil;
    private final NotificationService notificationService;

    // ─── Stages list ──────────────────────────────────────────────

    @GetMapping("/stages")
    public ResponseEntity<List<String>> stages() {
        return ResponseEntity.ok(VALID_STAGES);
    }

    // ─── Kanban view: applications grouped by stage ───────────────

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> kanbanByJob(
            @PathVariable Long jobId, HttpServletRequest request) {

        Long hrId = requireUser(request);
        Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrId);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
        if (job.getCompany() == null || !hrCompanyId.equals(job.getCompany().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem ứng viên job này");
        }

        // Native query (composite key + custom field)
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
                "SELECT s.apply_form_id, s.user_id, s.time_sent, s.status, s.pipeline_stage, " +
                "       s.hr_note, s.stage_updated_at " +
                "  FROM apply_form_user_to_job s " +
                " WHERE s.job_id = :jobId " +
                " ORDER BY s.time_sent DESC")
                .setParameter("jobId", jobId)
                .getResultList();

        // Group by stage
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (String stage : VALID_STAGES) grouped.put(stage, new ArrayList<>());

        for (Object[] row : rows) {
            String stage = row[4] != null ? row[4].toString() : "SCREENING";
            if (!grouped.containsKey(stage)) grouped.put(stage, new ArrayList<>());

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("applyFormId", row[0]);
            m.put("candidateId", row[1]);
            m.put("appliedAt", row[2]);
            m.put("status", row[3]);
            m.put("pipelineStage", stage);
            m.put("hrNote", row[5]);
            m.put("stageUpdatedAt", row[6]);
            // Pull candidate basic info
            if (row[1] != null) {
                accountRepository.findById(((Number) row[1]).longValue()).ifPresent(acc -> {
                    m.put("candidateEmail", acc.getEmail());
                    m.put("candidateName", acc.getFullName());
                    m.put("candidateAvatar", acc.getAvatarUrl());
                });
            }
            grouped.get(stage).add(m);
        }
        return ResponseEntity.ok(grouped);
    }

    // ─── Move stage ───────────────────────────────────────────────

    @PostMapping("/applications/{applyFormId}/{jobId}/move")
    @Transactional
    public ResponseEntity<Map<String, Object>> moveStage(
            @PathVariable Long applyFormId,
            @PathVariable Long jobId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        Long hrId = requireUser(request);
        Long hrCompanyId = authorizationService.requireApprovedCompanyOf(hrId);

        String toStage = asString(body.get("toStage"));
        if (toStage == null || !VALID_STAGES.contains(toStage)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Stage không hợp lệ: " + toStage + " (valid: " + VALID_STAGES + ")");
        }

        // Verify HR owns the job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));
        if (job.getCompany() == null || !hrCompanyId.equals(job.getCompany().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền");
        }

        // Load application
        ApplyFormSentToJob.ApplyFormSentToJobId pk =
                new ApplyFormSentToJob.ApplyFormSentToJobId(jobId, applyFormId);
        ApplyFormSentToJob app = applicationRepository.findById(pk)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application không tồn tại"));

        String fromStage = app.getPipelineStage() != null ? app.getPipelineStage() : "SCREENING";
        app.setPipelineStage(toStage);
        app.setStageUpdatedAt(LocalDateTime.now());
        app.setStageUpdatedBy(hrId);
        applicationRepository.save(app);

        // Audit history
        ApplicationStageHistory history = ApplicationStageHistory.builder()
                .applyFormId(applyFormId)
                .jobId(jobId)
                .fromStage(fromStage)
                .toStage(toStage)
                .note(asString(body.get("note")))
                .movedBy(hrId)
                .build();
        em.persist(history);

        // Optionally send email (if templateId or sendEmail=true)
        Long templateId = asLong(body.get("templateId"));
        boolean sendEmail = templateId != null || Boolean.TRUE.equals(body.get("sendEmail"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("applyFormId", applyFormId);
        response.put("jobId", jobId);
        response.put("fromStage", fromStage);
        response.put("toStage", toStage);

        if (sendEmail) {
            try {
                String emailStatus = sendStageEmail(app, job, toStage, templateId, hrId);
                response.put("emailSent", true);
                response.put("emailStatus", emailStatus);
            } catch (Exception e) {
                log.error("Failed to send stage email", e);
                response.put("emailSent", false);
                response.put("emailError", e.getMessage());
            }
        }

        // In-app notification cho candidate — luôn gửi (không phụ thuộc sendEmail flag).
        // Best-effort: không cho lỗi ở đây ảnh hưởng tới response chuyển stage.
        try {
            sendStageInAppNotification(app, job, toStage);
        } catch (Exception e) {
            log.warn("Failed to create in-app notification for stage move (applyFormId={}, toStage={})",
                    applyFormId, toStage, e);
        }

        return ResponseEntity.ok(response);
    }

    /** Tạo in-app notification cho candidate khi HR chuyển stage. */
    private void sendStageInAppNotification(ApplyFormSentToJob app, Job job, String toStage) {
        Long candidateId = app.getUserId();
        if (candidateId == null) return;

        String jobTitle = job.getTitle() != null ? job.getTitle() : "công việc";
        String companyName = (job.getCompany() != null && job.getCompany().getName() != null)
                ? job.getCompany().getName() : "Nhà tuyển dụng";

        NotificationType type;
        String content;
        switch (toStage) {
            case "HIRED" -> {
                type = NotificationType.APPLICATION_ACCEPTED;
                content = String.format("%s đã chấp nhận hồ sơ của bạn cho vị trí \"%s\".", companyName, jobTitle);
            }
            case "REJECTED" -> {
                type = NotificationType.APPLICATION_REJECTED;
                content = String.format("Đơn ứng tuyển của bạn cho vị trí \"%s\" tại %s đã bị từ chối.", jobTitle, companyName);
            }
            default -> {
                type = NotificationType.APPLICATION_STATUS_CHANGED;
                content = String.format("Hồ sơ của bạn cho vị trí \"%s\" tại %s đã chuyển sang giai đoạn %s.",
                        jobTitle, companyName, vietnameseStageLabel(toStage));
            }
        }

        notificationService.createNotification(CreateNotificationRequest.builder()
                .recipientId(candidateId)
                .recipientType(RecipientType.USER)
                .type(type)
                .content(content)
                .entityType("APPLICATION")
                .entityId(app.getId().getApplyFormId())
                .actionUrl("/candidate/applied-jobs")
                .build());
    }

    private String vietnameseStageLabel(String stage) {
        return switch (stage) {
            case "SCREENING" -> "Đơn mới";
            case "PHONE_SCREEN" -> "Đã liên hệ";
            case "INTERVIEW" -> "Phỏng vấn";
            case "OFFER" -> "Gửi offer";
            case "HIRED" -> "Đã nhận";
            case "REJECTED" -> "Từ chối";
            default -> stage;
        };
    }

    /** Render & send the email; returns "sent" / "skipped (no candidate email)" / etc. */
    private String sendStageEmail(ApplyFormSentToJob app, Job job, String toStage,
                                  Long templateId, Long hrId) {
        var candidate = accountRepository.findById(app.getUserId()).orElse(null);
        if (candidate == null || candidate.getEmail() == null) return "skipped: no candidate email";
        var hr = accountRepository.findById(hrId).orElse(null);

        HrEmailTemplate tpl;
        if (templateId != null) {
            tpl = templateRepository.findById(templateId).orElse(null);
            if (tpl == null) return "skipped: template not found";
        } else {
            String type = mapStageToTemplateType(toStage);
            tpl = templateRepository.findFirstByTemplateTypeAndIsDefault(type, true).orElse(null);
            if (tpl == null) return "skipped: no default template for stage " + toStage;
        }

        String companyName = (job.getCompany() != null && job.getCompany().getName() != null)
                ? job.getCompany().getName() : "Công ty";
        String hrName = (hr != null && hr.getFullName() != null) ? hr.getFullName() : "Phòng nhân sự";

        String subject = render(tpl.getSubject(),
                candidate.getFullName(), job.getTitle(), companyName, hrName);
        String body = render(tpl.getBody(),
                candidate.getFullName(), job.getTitle(), companyName, hrName);

        emailService.sendEmail(candidate.getEmail(), subject, body);
        return "sent";
    }

    private String mapStageToTemplateType(String stage) {
        return switch (stage) {
            case "INTERVIEW", "PHONE_SCREEN" -> "INTERVIEW_INVITE";
            case "OFFER", "HIRED" -> "OFFER";
            case "REJECTED" -> "REJECT";
            default -> "THANK_YOU";
        };
    }

    private String render(String template, String candidateName, String jobTitle,
                          String companyName, String hrName) {
        if (template == null) return "";
        return template
                .replace("{{candidate_name}}", candidateName != null ? candidateName : "Bạn")
                .replace("{{job_title}}", jobTitle != null ? jobTitle : "")
                .replace("{{company_name}}", companyName != null ? companyName : "")
                .replace("{{hr_name}}", hrName != null ? hrName : "");
    }

    // ─── Email templates ──────────────────────────────────────────

    @GetMapping("/templates")
    public ResponseEntity<List<HrEmailTemplate>> listTemplates(HttpServletRequest request) {
        Long hrId = requireUser(request);
        Long companyId = authorizationService.requireApprovedCompanyOf(hrId);
        return ResponseEntity.ok(
            templateRepository.findByCompanyIdOrCompanyIdIsNullOrderByTemplateTypeAsc(companyId));
    }

    @PostMapping("/templates")
    public ResponseEntity<HrEmailTemplate> createTemplate(
            @RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long hrId = requireUser(request);
        Long companyId = authorizationService.requireApprovedCompanyOf(hrId);

        HrEmailTemplate tpl = HrEmailTemplate.builder()
                .companyId(companyId)
                .name(asString(body.get("name")))
                .templateType(asString(body.get("templateType")))
                .subject(asString(body.get("subject")))
                .body(asString(body.get("body")))
                .isDefault(false)
                .createdBy(hrId)
                .build();
        return ResponseEntity.ok(templateRepository.save(tpl));
    }

    // ─── Helpers ──────────────────────────────────────────────────

    private Long requireUser(HttpServletRequest request) {
        Long id = jwtTokenUtil.getUserIdFromHeader(request);
        if (id == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        return id;
    }

    private String asString(Object o) {
        if (o == null) return null;
        String s = o.toString().trim();
        return s.isEmpty() ? null : s;
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }
}

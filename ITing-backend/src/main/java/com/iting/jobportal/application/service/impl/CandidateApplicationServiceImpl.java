package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.request.ApplyJobRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.dto.response.ApplicationSubmitResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.application.repository.CandidateApplicationRepository;
import com.iting.jobportal.common.event.KafkaTopics;
import com.iting.jobportal.common.event.outbox.OutboxAppender;
import com.iting.jobportal.common.event.payload.ApplicationCreatedEvent;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.application.service.CandidateApplicationService;
import com.iting.jobportal.application.service.MatchScoreService;
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.notification.service.NotificationService;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CandidateApplicationServiceImpl implements CandidateApplicationService {

    private final CandidateApplicationRepository candidateApplicationRepository;
    private final ApplyFormRepository applyFormRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationMapperUtil applicationMapperUtil;
    private final CVRepository cvRepository;
    private final Optional<OutboxAppender> outboxAppender;
    private final KafkaTopics kafkaTopics;
    private final MatchScoreService matchScoreService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ApplicationSubmitResponse applyJob(Long userId, ApplyJobRequest request) {

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy job"));

        if (candidateApplicationRepository.existsByUserIdAndJobId(userId, request.getJobId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã ứng tuyển rồi");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy user"));

        // 🔥 LẤY CV
        CV cv = null;
        if (request.getCvId() != null) {
            cv = cvRepository.findById(request.getCvId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CV không tồn tại"));

            // check ownership
            if (!cv.getProfile().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CV không thuộc về bạn");
            }
        }

        // 🔥 CREATE APPLY FORM
        ApplyForm applyForm = ApplyForm.builder()
                .userId(userId)
                .cv(cv) // ✅ chuẩn
                .cvTitle(cv != null ? cv.getTitle() : null) // optional
                .applicantName(user.getAccount() != null ? user.getAccount().getFullName() : null)
                .introduction(request.getCoverLetter())
                .build();

        ApplyForm savedForm = applyFormRepository.save(applyForm);

        // 🔥 LINK JOB
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(request.getJobId(), savedForm.getId()))
                .userId(userId)
                .build();

        ApplyFormSentToJob savedSent = candidateApplicationRepository.save(sent);

        // ✅ Increment application count on the job
        jobRepository.incrementApplicationCount(request.getJobId());

        // 🤖 Tính match score CV ↔ Job (async, không block luồng apply)
        matchScoreService.computeAndSaveAsync(savedSent.getId(), userId, job);

        // Outbox: phát event cho recommendation/notification/audit consume async
        outboxAppender.ifPresent(appender -> appender.append(
                kafkaTopics.getApplicationCreated(),
                "application",
                ApplicationCreatedEvent.of(
                        savedForm.getId(),
                        request.getJobId(),
                        userId,
                        job.getPostedByHrId())));

        // 🔔 Gửi thông báo cho ứng viên
        try {
            notificationService.createNotification(
                    CreateNotificationRequest.builder()
                            .recipientId(userId)
                            .recipientType(RecipientType.USER)
                            .type(NotificationType.APPLICATION_SUBMITTED)
                            .content("Bạn đã ứng tuyển thành công vị trí \"" + job.getTitle() + "\". Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.")
                            .entityType("APPLICATION")
                            .entityId(savedForm.getId())
                            .actionUrl("/candidate/applied-jobs")
                            .build());
        } catch (Exception e) {
            // Không block luồng apply nếu notification fail
        }

        // 🔔 Gửi thông báo cho nhà tuyển dụng (HR đăng tin)
        try {
            if (job.getPostedByHrId() != null) {
                String candidateName = user.getAccount() != null ? user.getAccount().getFullName() : "Ứng viên";
                notificationService.createNotification(
                        CreateNotificationRequest.builder()
                                .recipientId(job.getCompany().getId())
                                .recipientType(RecipientType.COMPANY)
                                .type(NotificationType.APPLICATION_SUBMITTED)
                                .content(candidateName + " vừa ứng tuyển vị trí \"" + job.getTitle() + "\".")
                                .entityType("APPLICATION")
                                .entityId(savedForm.getId())
                                .actionUrl("/employer/manage-jobs")
                                .build());
            }
        } catch (Exception e) {
            // Không block luồng apply nếu notification fail
        }

        return ApplicationSubmitResponse.builder()
                .id(savedForm.getId())
                .jobId(request.getJobId())
                .timeSent(savedSent.getTimeSent())
                .build();
    }

    @Override
    @Transactional
    public void withdrawApplication(Long userId, Long applicationId) {
        ApplyForm applyForm = applyFormRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));

        if (!applyForm.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền rút đơn này");
        }

        ApplyFormSentToJob sent = candidateApplicationRepository.findByIdApplyFormId(applicationId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy liên kết ứng tuyển"));

        // Edge case: đã rút trước đó → idempotent 409
        if (sent.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn ứng tuyển đã được rút trước đó");
        }

        // Edge case: HR đã ra quyết định (accept/reject) → không cho rút nữa
        if (sent.getStatus() == ApplicationStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Đơn đã được nhà tuyển dụng chấp nhận, không thể rút. Vui lòng liên hệ trực tiếp NTD.");
        }
        if (sent.getStatus() == ApplicationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Đơn đã bị từ chối, không cần rút nữa.");
        }

        // Job đã đóng/hết hạn vẫn cho rút để dọn dữ liệu ở phía ứng viên,
        // chỉ giảm applicationCount nếu job vẫn còn tồn tại.
        sent.setStatus(ApplicationStatus.WITHDRAWN);
        candidateApplicationRepository.save(sent);

        Long jobId = sent.getId().getJobId();
        if (jobRepository.existsById(jobId)) {
            jobRepository.decrementApplicationCount(jobId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getMyApplications(Long userId, int page, int size) {
        return getMyApplications(userId, null, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getMyApplications(Long userId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
        Page<com.iting.jobportal.application.entity.ApplyFormSentToJob> data;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            try {
                var statusEnum = com.iting.jobportal.application.entity.enums.ApplicationStatus
                        .valueOf(status.trim().toUpperCase());
                data = candidateApplicationRepository.findByUserIdAndStatus(userId, statusEnum, pageable);
            } catch (IllegalArgumentException ex) {
                // unknown status → return empty rather than error
                data = Page.empty(pageable);
            }
        } else {
            data = candidateApplicationRepository.findByUserId(userId, pageable);
        }
        return data.map(sent -> {
            ApplyForm form = applyFormRepository.findById(sent.getId().getApplyFormId())
                    .orElseThrow(() -> new RuntimeException("ApplyForm not found"));
            return applicationMapperUtil.buildFullResponse(form, sent);
        });
    }

    @Override
    public boolean hasApplied(Long userId, Long jobId) {
        return candidateApplicationRepository.existsByUserIdAndJobId(userId, jobId);
    }
}

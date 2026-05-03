package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.request.ApplyJobRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.dto.response.ApplicationSubmitResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
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
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.repository.CVRepository;
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
                .applicantName(user.getFullName())
                .introduction(request.getCoverLetter())
                .build();

        ApplyForm savedForm = applyFormRepository.save(applyForm);

        // 🔥 LINK JOB
        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(request.getJobId(), savedForm.getId()))
                .build();

        ApplyFormSentToJob savedSent = candidateApplicationRepository.save(sent);

        // ✅ Increment application count on the job
        jobRepository.incrementApplicationCount(request.getJobId());

        // Outbox: phát event cho recommendation/notification/audit consume async
        outboxAppender.ifPresent(appender -> appender.append(
                kafkaTopics.getApplicationCreated(),
                "application",
                ApplicationCreatedEvent.of(
                        savedForm.getId(),
                        request.getJobId(),
                        userId,
                        job.getPostedByHrId())));

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

        // Find the jobId before deleting
        ApplyFormSentToJob sent = candidateApplicationRepository.findByIdApplyFormId(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy liên kết ứng tuyển"));
        Long jobId = sent.getId().getJobId();

        candidateApplicationRepository.deleteByIdApplyFormId(applicationId);
        applyFormRepository.deleteById(applicationId);

        // ✅ Decrement application count on the job
        jobRepository.decrementApplicationCount(jobId);
    }

    @Override
    public Page<ApplicationResponse> getMyApplications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
        return candidateApplicationRepository.findByUserId(userId, pageable)
                .map(sent -> {
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

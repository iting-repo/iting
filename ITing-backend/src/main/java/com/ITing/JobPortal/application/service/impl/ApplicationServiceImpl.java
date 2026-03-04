package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.*;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.ApplyFormSentToJobRepository;
import com.iting.jobportal.application.service.ApplicationService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplyFormRepository applyFormRepository;
    private final ApplyFormSentToJobRepository applyFormSentToJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // ========== CHO ỨNG VIÊN ==========

    @Override
    @Transactional
    public ApplicationResponse applyJob(String userId, ApplyJobRequest request) {

        jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applyFormSentToJobRepository.existsByUserIdAndJobId(userId, request.getJobId())) {
            throw new RuntimeException("Bạn đã ứng tuyển công việc này rồi");
        }

        // ✅ Lấy user từ DB để auto-fill applicant info
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String applicantName = buildFullName(user.getFirstName(), user.getLastName());

        String cvTitle = request.getCvId() != null ? ("CV_" + request.getCvId()) : null;

        ApplyForm applyForm = ApplyForm.builder()
                .userId(userId)
                .cvTitle(cvTitle)
                .applicantName(applicantName)
                .introduction(request.getCoverLetter())
                .build();

        ApplyForm savedForm = applyFormRepository.save(applyForm);

        ApplyFormSentToJob sent = ApplyFormSentToJob.builder()
                .id(new ApplyFormSentToJob.ApplyFormSentToJobId(request.getJobId(), savedForm.getId()))
                .build();

        ApplyFormSentToJob savedSent = applyFormSentToJobRepository.save(sent);

        return ApplicationResponse.fromEntities(savedForm, savedSent);
    }

    private String buildFullName(String firstName, String lastName) {
        String fn = firstName == null ? "" : firstName.trim();
        String ln = lastName == null ? "" : lastName.trim();
        String full = (fn + " " + ln).trim();
        return full.isEmpty() ? null : full;
    }

    @Override
    @Transactional
    public void withdrawApplication(String userId, Long applicationId) {
        ApplyForm applyForm = applyFormRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!applyForm.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        applyFormSentToJobRepository.deleteByIdApplyFormId(applicationId);
        applyFormRepository.deleteById(applicationId);
    }

    @Override
    public Page<ApplicationResponse> getMyApplications(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
        return applyFormSentToJobRepository.findByUserId(userId, pageable)
                .map(sent -> {
                    Long formId = sent.getId().getApplyFormId();
                    ApplyForm form = applyFormRepository.findById(formId)
                            .orElseThrow(() -> new RuntimeException("Application not found"));
                    return ApplicationResponse.fromEntities(form, sent);
                });
    }

    @Override
    public boolean hasApplied(String userId, Long jobId) {
        return applyFormSentToJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    // ========== CHO NHÀ TUYỂN DỤNG ==========

    @Override
    public Page<ApplicationResponse> getApplicationsByJob(Long employerId, Long jobId, int page, int size) {
        throw new UnsupportedOperationException("Employer application views are not supported with current schema.sql mapping");
    }

    @Override
    public Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, int page, int size) {
        throw new UnsupportedOperationException("Employer application views are not supported with current schema.sql mapping");
    }

    @Override
    public Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request) {
        throw new UnsupportedOperationException("Employer application search is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public ApplicationResponse viewApplication(Long employerId, Long applicationId) {
        throw new UnsupportedOperationException("Employer application views are not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long employerId, Long applicationId, 
                                                       UpdateApplicationStatusRequest request) {
        throw new UnsupportedOperationException("Employer application status updates are not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public ApplicationResponse acceptApplication(Long employerId, Long applicationId, String note) {
        throw new UnsupportedOperationException("Employer application actions are not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public ApplicationResponse rejectApplication(Long employerId, Long applicationId, String note) {
        throw new UnsupportedOperationException("Employer application actions are not supported with current schema.sql mapping");
    }

    @Override
    public long countApplicationsByStatus(Long employerId, Long jobId, String status) {
        throw new UnsupportedOperationException("Employer application statistics are not supported with current schema.sql mapping");
    }

    // ========== THỐNG KÊ ==========

    @Override
    public ApplicationStats getStatsForEmployer(Long employerId) {
        throw new UnsupportedOperationException("Employer application statistics are not supported with current schema.sql mapping");
    }

    @Override
    public ApplicationStats getStatsForJob(Long jobId) {
        throw new UnsupportedOperationException("Application statistics are not supported with current schema.sql mapping");
    }
}

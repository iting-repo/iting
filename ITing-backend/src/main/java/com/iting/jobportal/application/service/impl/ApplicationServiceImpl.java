package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.*;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.ApplyFormSentToJobRepository;
import com.iting.jobportal.application.service.ApplicationService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.entity.ContactInfo;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.Education;
import com.iting.jobportal.userprofile.entity.Experience;
import com.iting.jobportal.userprofile.repository.ContactInfoRepository;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.EducationRepository;
import com.iting.jobportal.userprofile.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplyFormRepository applyFormRepository;
    private final ApplyFormSentToJobRepository applyFormSentToJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CVRepository cvRepository;
    private final ContactInfoRepository contactInfoRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;

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
        jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());

        return applyFormSentToJobRepository.findByJobId(jobId, pageable)
                .map(sent -> {
                    Long formId = sent.getId().getApplyFormId();
                    ApplyForm form = applyFormRepository.findById(formId)
                            .orElseThrow(() -> new RuntimeException("ApplyForm not found: " + formId));
                    return buildFullResponse(form, sent);
                });
    }

    // ========== SHARED HELPER ==========

    private ApplicationResponse buildFullResponse(ApplyForm applyForm, ApplyFormSentToJob sent) {
        Long jobId = sent.getId().getJobId();
        String userId = applyForm.getUserId();

        // Job title
        String jobTitle = jobRepository.findById(jobId)
                .map(Job::getPosition)
                .orElse(null);

        // Avatar
        String avatarUrl = userRepository.findById(userId)
                .map(User::getAvatarUrl)
                .orElse(null);

        // CV
        String cvFileName = null;
        String cvFileType = null;
        String cvUrl = null;
        if (applyForm.getCvTitle() != null && applyForm.getCvTitle().startsWith("CV_")) {
            try {
                Long cvId = Long.parseLong(applyForm.getCvTitle().substring(3));
                Optional<CV> cvOpt = cvRepository.findById(cvId);
                if (cvOpt.isPresent()) {
                    CV cv = cvOpt.get();
                    cvUrl = cv.getFileUrl();
                    if (cvUrl != null) {
                        String path = cvUrl.contains("/") ? cvUrl.substring(cvUrl.lastIndexOf('/') + 1) : cvUrl;
                        int dotIdx = path.lastIndexOf('.');
                        if (dotIdx > 0) {
                            cvFileName = path.substring(0, dotIdx);
                            cvFileType = path.substring(dotIdx + 1).toUpperCase();
                        } else {
                            cvFileName = path;
                            cvFileType = "PDF";
                        }
                    }
                }
            } catch (NumberFormatException ignored) {
                cvFileName = applyForm.getCvTitle();
            }
        }

        // Contact info
        String phoneNumber = null;
        String email = null;
        Optional<ContactInfo> contactOpt = contactInfoRepository.findById(userId);
        if (contactOpt.isPresent()) {
            ContactInfo c = contactOpt.get();
            phoneNumber = c.getPhone();
            email = c.getEmail();
        }
        if (email == null || email.isBlank()) {
            email = userId;
        }

        // Years of experience (sum of all experience durations)
        List<Experience> experiences = experienceRepository.findByUserId(userId);
        int totalMonths = 0;
        LocalDate now = LocalDate.now();
        for (Experience exp : experiences) {
            LocalDate start = exp.getStartDate();
            LocalDate end = exp.getEndDate() != null ? exp.getEndDate() : now;
            if (start != null) {
                totalMonths += (int) ChronoUnit.MONTHS.between(start, end);
            }
        }
        Integer yearsExperience = totalMonths > 0 ? Math.max(1, totalMonths / 12) : null;

        // Highest education degree
        List<Education> educations = educationRepository.findByUserId(userId);
        String education = educations.stream()
                .filter(e -> e.getDegree() != null)
                .max(Comparator.comparing(e -> e.getEndDate() != null ? e.getEndDate() : LocalDate.MIN))
                .map(Education::getDegree)
                .orElse(null);

        return ApplicationResponse.builder()
                .id(applyForm.getId())
                .userId(userId)
                .jobId(jobId)
                .applicantName(applyForm.getApplicantName())
                .avatarUrl(avatarUrl)
                .jobTitle(jobTitle)
                .introduction(applyForm.getIntroduction())
                .cvFileName(cvFileName)
                .cvFileType(cvFileType)
                .cvUrl(cvUrl)
                .phoneNumber(phoneNumber)
                .email(email)
                .yearsExperience(yearsExperience)
                .education(education)
                .timeSent(sent.getTimeSent())
                .build();
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
        ApplyForm applyForm = applyFormRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        ApplyFormSentToJob sent = applyFormSentToJobRepository
                .findByIdApplyFormId(applicationId)
                .orElseThrow(() -> new RuntimeException("Application job mapping not found: " + applicationId));

        return buildFullResponse(applyForm, sent);
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

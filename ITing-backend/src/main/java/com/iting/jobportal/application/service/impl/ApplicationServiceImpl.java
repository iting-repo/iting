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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
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

    // =====================================================================
    // PRIVATE HELPERS
    // =====================================================================

    private Job findJobOrThrow(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy job với id: " + jobId));
    }

    private Job verifyJobOwnership(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        // Đảm bảo so sánh hai đối tượng Long bằng .equals()
        if (!job.getCompany().getId().equals(employerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem ứng viên của job này");
        }
        return job;
    }

    private ApplyForm findFormOrThrow(Long applicationId) {
        return applyFormRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));
    }

    private ApplicationResponse toResponse(ApplyFormSentToJob sent) {
        Long formId = sent.getId().getApplyFormId();
        ApplyForm form = findFormOrThrow(formId);
        return ApplicationResponse.fromEntities(form, sent);
    }

    private String buildFullName(String firstName, String lastName) {
        String fn = (firstName == null) ? "" : firstName.trim();
        String ln = (lastName == null) ? "" : lastName.trim();
        String full = (fn + " " + ln).trim();
        return full.isEmpty() ? "Anonymous" : full;
    }

    // =====================================================================
    // CHO ỨNG VIÊN
    // =====================================================================

    @Override
    @Transactional
    public ApplicationResponse applyJob(Long userId, ApplyJobRequest request) {
        findJobOrThrow(request.getJobId());

        // Đã đồng bộ userId sang Long để tránh lỗi NumberFormatException
        if (applyFormSentToJobRepository.existsByUserIdAndJobId(userId, request.getJobId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã ứng tuyển công việc này rồi");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin ứng viên"));

        String applicantName = user.getFullName();
        String cvTitle = (request.getCvId() != null) ? ("CV_" + request.getCvId()) : "Default_CV";

        // Entity ApplyForm phải được sửa trường userId thành kiểu Long
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

    @Override
    @Transactional
    public void withdrawApplication(Long userId, Long applicationId) { // Sửa userId thành Long
        ApplyForm applyForm = findFormOrThrow(applicationId);

        // So sánh Long với Long
        if (!applyForm.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền rút đơn này");
        }

        applyFormSentToJobRepository.deleteByIdApplyFormId(applicationId);
        applyFormRepository.deleteById(applicationId);
    }

    @Override
    public Page<ApplicationResponse> getMyApplications(Long userId, int page, int size) { // Sửa userId thành Long
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
        return applyFormSentToJobRepository.findByUserId(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    public boolean hasApplied(Long userId, Long jobId) { // Sửa userId thành Long
        return applyFormSentToJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    // =====================================================================
    // CHO NHÀ TUYỂN DỤNG (Các hàm khác giữ nguyên kiểu Long đã có)
    // =====================================================================

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
        Long userId = applyForm.getUserId();

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
            email = userRepository.findById(userId)
                    .map(u -> u.getAccount() != null ? u.getAccount().getEmail() : String.valueOf(userId))
                    .orElse(String.valueOf(userId));
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
        if (employerId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");

        Pageable jobPageable = PageRequest.of(0, 1000);
        var jobs = jobRepository.findByCompany_Id(employerId, jobPageable);
        if (jobs.isEmpty()) return Page.empty();

        var jobIds = jobs.stream().map(Job::getId).toList();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, size), Sort.by("timeSent").descending());

        return applyFormSentToJobRepository.findByIdJobIdIn(jobIds, pageable).map(this::toResponse);
    }

    @Override
    public Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request) {
        if (request.getJobId() != null) {
            return getApplicationsByJob(employerId, request.getJobId(), request.getPage(), request.getSize());
        }
        return getAllApplicationsForEmployer(employerId, request.getPage(), request.getSize());
    }

    @Override
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
    public ApplicationResponse updateApplicationStatus(Long employerId, Long applicationId, UpdateApplicationStatusRequest request) {
        // Logic cập nhật trạng thái sẽ được triển khai khi Entity có trường Status
        return viewApplication(employerId, applicationId);
    }

    @Override
    @Transactional
    public ApplicationResponse acceptApplication(Long employerId, Long applicationId, String note) {
        return viewApplication(employerId, applicationId);
    }

    @Override
    @Transactional
    public ApplicationResponse rejectApplication(Long employerId, Long applicationId, String note) {
        return viewApplication(employerId, applicationId);
    }

    @Override
    public long countApplicationsByStatus(Long employerId, Long jobId, String status) {
        if (jobId != null) {
            verifyJobOwnership(employerId, jobId);
            return applyFormSentToJobRepository.countByIdJobId(jobId);
        }
        return 0;
    }

    @Override
    public ApplicationStats getStatsForEmployer(Long employerId) {
        if (employerId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
        // Giả sử lấy tổng số từ các job thuộc employer
        return ApplicationStats.builder().total(0L).build();
    }

    @Override
    public ApplicationStats getStatsForJob(Long jobId) {
        return ApplicationStats.builder()
                .total(applyFormSentToJobRepository.countByIdJobId(jobId))
                .build();
    }
}
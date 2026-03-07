package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.*;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplyFormRepository applyFormRepository;
    private final ApplyFormSentToJobRepository applyFormSentToJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // =====================================================================
    // PRIVATE HELPERS
    // =====================================================================

    private Job findJobOrThrow(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy job với id: " + jobId));
    }

    /** Đảm bảo job thuộc về employer này (companyId = Account.Id của employer) */
    private Job verifyJobOwnership(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        if (!job.getCompanyId().equals(employerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem ứng viên của job này");
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
        String fn = firstName == null ? "" : firstName.trim();
        String ln = lastName == null ? "" : lastName.trim();
        String full = (fn + " " + ln).trim();
        return full.isEmpty() ? null : full;
    }

    // =====================================================================
    // CHO ỨNG VIÊN
    // =====================================================================

    @Override
    @Transactional
    public ApplicationResponse applyJob(String userId, ApplyJobRequest request) {
        findJobOrThrow(request.getJobId());

        if (applyFormSentToJobRepository.existsByUserIdAndJobId(userId, request.getJobId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã ứng tuyển công việc này rồi");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

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

    @Override
    @Transactional
    public void withdrawApplication(String userId, Long applicationId) {
        ApplyForm applyForm = findFormOrThrow(applicationId);
        if (!applyForm.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền rút đơn này");
        }
        applyFormSentToJobRepository.deleteByIdApplyFormId(applicationId);
        applyFormRepository.deleteById(applicationId);
    }

    @Override
    public Page<ApplicationResponse> getMyApplications(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
        return applyFormSentToJobRepository.findByUserId(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    public boolean hasApplied(String userId, Long jobId) {
        return applyFormSentToJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    // =====================================================================
    // CHO NHÀ TUYỂN DỤNG
    // =====================================================================

    /**
     * Lấy danh sách tất cả ứng viên của một job cụ thể.
     * Employer phải là chủ sở hữu của job đó (companyId = Account.Id của employer).
     */
    @Override
    public Page<ApplicationResponse> getApplicationsByJob(Long employerId, Long jobId, int page, int size) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        // Kiểm tra job tồn tại và thuộc về employer này
        verifyJobOwnership(employerId, jobId);

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("timeSent").descending());

        return applyFormSentToJobRepository.findByIdJobId(jobId, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, int page, int size) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        // Lấy tất cả jobId thuộc employer
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable jobPageable = PageRequest.of(0, 1000); // lấy tối đa 1000 job

        var jobs = jobRepository.findByCompanyId(employerId, jobPageable);
        if (jobs.isEmpty()) {
            return Page.empty();
        }
        var jobIds = jobs.stream().map(j -> j.getId()).toList();

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("timeSent").descending());

        // Truy vấn tất cả ứng viên trong các jobs của employer
        return applyFormSentToJobRepository.findByIdJobIdIn(jobIds, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        // Nếu có jobId cụ thể — tìm trong job đó (sau khi verify ownership)
        if (request.getJobId() != null) {
            verifyJobOwnership(employerId, request.getJobId());
            int safePage = Math.max(request.getPage(), 0);
            int safeSize = Math.max(1, Math.min(request.getSize(), 100));
            Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("timeSent").descending());
            return applyFormSentToJobRepository.findByIdJobId(request.getJobId(), pageable)
                    .map(this::toResponse);
        }
        // Không có jobId → trả về toàn bộ ứng viên của employer
        return getAllApplicationsForEmployer(employerId, request.getPage(), request.getSize());
    }

    @Override
    public ApplicationResponse viewApplication(Long employerId, Long applicationId) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        ApplyForm form = findFormOrThrow(applicationId);
        // Tìm bản ghi sent tương ứng
        ApplyFormSentToJob sent = applyFormSentToJobRepository.findAll().stream()
                .filter(s -> s.getId().getApplyFormId().equals(applicationId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));

        // Kiểm tra employer sở hữu job đó
        verifyJobOwnership(employerId, sent.getId().getJobId());
        return ApplicationResponse.fromEntities(form, sent);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long employerId, Long applicationId,
                                                       UpdateApplicationStatusRequest request) {
        return viewApplication(employerId, applicationId); // verify + return (status field sẽ thêm sau nếu entity có)
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

    // =====================================================================
    // THỐNG KÊ
    // =====================================================================

    @Override
    public ApplicationStats getStatsForEmployer(Long employerId) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        return ApplicationStats.builder()
                .total(0L)
                .build();
    }

    @Override
    public ApplicationStats getStatsForJob(Long jobId) {
        long total = applyFormSentToJobRepository.countByIdJobId(jobId);
        return ApplicationStats.builder()
                .total(total)
                .build();
    }
}

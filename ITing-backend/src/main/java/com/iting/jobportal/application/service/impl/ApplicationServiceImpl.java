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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

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
        if (employerId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
        verifyJobOwnership(employerId, jobId);

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, size), Sort.by("timeSent").descending());
        return applyFormSentToJobRepository.findByIdJobId(jobId, pageable).map(this::toResponse);
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
        ApplyForm form = findFormOrThrow(applicationId);
        // Tìm bản ghi sent tương ứng dựa trên ID tổ hợp
        ApplyFormSentToJob sent = applyFormSentToJobRepository.findAll().stream()
                .filter(s -> s.getId().getApplyFormId().equals(applicationId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy liên kết ứng tuyển"));

        verifyJobOwnership(employerId, sent.getId().getJobId());
        return ApplicationResponse.fromEntities(form, sent);
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
package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.request.ApplicationSearchRequest;
import com.iting.jobportal.application.dto.request.ApplicationStats;
import com.iting.jobportal.application.dto.request.UpdateApplicationStatusRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.application.repository.EmployerApplicationRepository;
import com.iting.jobportal.application.service.EmployerApplicationService;
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployerApplicationServiceImpl implements EmployerApplicationService {

    private final EmployerApplicationRepository employerApplicationRepository;
    private final ApplyFormRepository applyFormRepository;
    private final JobRepository jobRepository;
    private final ApplicationMapperUtil applicationMapperUtil;
    private final NotificationService notificationService;

    private Job verifyJobOwnership(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy job"));
        if (!job.getCompany().getId().equals(employerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập job này");
        }
        return job;
    }

    private ApplicationResponse toResponse(ApplyFormSentToJob sent) {
        Long formId = sent.getId().getApplyFormId();
        ApplyForm form = applyFormRepository.findById(formId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn ứng tuyển"));
        return applicationMapperUtil.buildFullResponse(form, sent);
    }

    @Override
    public Page<ApplicationResponse> getApplicationsByJob(Long employerId, Long jobId, int page, int size) {
        verifyJobOwnership(employerId, jobId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
        return employerApplicationRepository.findByJobId(jobId, pageable).map(this::toResponse);
    }

    @Override
    public Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, int page, int size) {
        if (employerId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
        var jobs = jobRepository.findByCompany_Id(employerId, PageRequest.of(0, 1000));
        if (jobs.isEmpty()) return Page.empty();
        
        var jobIds = jobs.stream().map(Job::getId).toList();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, size), Sort.by("timeSent").descending());
        return employerApplicationRepository.findByIdJobIdIn(jobIds, pageable).map(this::toResponse);
    }

    @Override
    public Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request) {
        if (employerId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
        
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), 
                Sort.by(request.getSortOrder().equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, 
                request.getSortBy()));

        String normalizedKeyword = null;
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            normalizedKeyword = "%" + request.getKeyword().toLowerCase() + "%";
        }

        if (request.getJobId() != null) {
            verifyJobOwnership(employerId, request.getJobId());
            return employerApplicationRepository.searchByJob(request.getJobId(), request.getStatus(), normalizedKeyword, pageable)
                    .map(this::toResponse);
        }
        
        // Search across all jobs of the employer
        var jobs = jobRepository.findByCompany_Id(employerId, PageRequest.of(0, 1000));
        if (jobs.isEmpty()) return Page.empty();
        var jobIds = jobs.stream().map(Job::getId).toList();
        
        return employerApplicationRepository.searchAll(jobIds, request.getStatus(), normalizedKeyword, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public ApplicationResponse viewApplication(Long employerId, Long applicationId) {
        ApplyFormSentToJob sent = employerApplicationRepository.findByIdApplyFormId(applicationId)
                .orElseThrow(() -> new RuntimeException("Application job mapping not found: " + applicationId));
        verifyJobOwnership(employerId, sent.getId().getJobId());
        return toResponse(sent);
    }

    @Override
    @Transactional
    public ApplicationResponse markApplicationAsViewed(Long employerId, Long applicationId) {
        ApplyFormSentToJob sent = employerApplicationRepository.findByIdApplyFormId(applicationId)
                .orElseThrow(() -> new RuntimeException("Application job mapping not found: " + applicationId));
        verifyJobOwnership(employerId, sent.getId().getJobId());

        if (sent.getStatus() == ApplicationStatus.PENDING) {
            sent.setStatus(ApplicationStatus.VIEWED);
            employerApplicationRepository.save(sent);

            // Gửi thông báo cho ứng viên
            ApplyForm form = applyFormRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("ApplyForm not found: " + applicationId));
            Job job = jobRepository.findById(sent.getId().getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found: " + sent.getId().getJobId()));

            CreateNotificationRequest notificationRequest = CreateNotificationRequest.builder()
                    .recipientId(form.getUserId())
                    .recipientType(RecipientType.USER)
                    .type(NotificationType.APPLICATION_VIEWED)
                    .content("Nhà tuyển dụng " + job.getCompany().getName() + " đã xem hồ sơ của bạn cho vị trí " + job.getTitle())
                    .entityType("APPLICATION")
                    .entityId(applicationId)
                    .actionUrl("/applications/" + applicationId)
                    .build();
            notificationService.createNotification(notificationRequest);
        }
        return toResponse(sent);
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long employerId, Long applicationId, UpdateApplicationStatusRequest request) {
        ApplyFormSentToJob sent = employerApplicationRepository.findByIdApplyFormId(applicationId)
                .orElseThrow(() -> new RuntimeException("Application job mapping not found"));
        verifyJobOwnership(employerId, sent.getId().getJobId());
        
        sent.setStatus(request.getStatus());
        employerApplicationRepository.save(sent);
        return toResponse(sent);
    }

    @Override
    @Transactional
    public ApplicationResponse acceptApplication(Long employerId, Long applicationId, String note) {
        UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
        request.setStatus(ApplicationStatus.ACCEPTED);
        return updateApplicationStatus(employerId, applicationId, request);
    }

    @Override
    @Transactional
    public ApplicationResponse rejectApplication(Long employerId, Long applicationId, String note) {
        UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
        request.setStatus(ApplicationStatus.REJECTED);
        return updateApplicationStatus(employerId, applicationId, request);
    }

    @Override
    public long countApplicationsByStatus(Long employerId, Long jobId, String status) {
        if (jobId != null) {
            verifyJobOwnership(employerId, jobId);
            return employerApplicationRepository.countByIdJobId(jobId);
        }
        return 0;
    }

    @Override
    public ApplicationStats getStatsForEmployer(Long employerId) {
        var jobs = jobRepository.findByCompany_Id(employerId, PageRequest.of(0, 1000));
        if (jobs.isEmpty()) {
            return ApplicationStats.builder().total(0L).build();
        }
        
        List<Long> jobIds = jobs.stream().map(Job::getId).toList();
        long total = employerApplicationRepository.countByIdJobIdIn(jobIds);
        
        // You could add count by status here if needed in the future
        return ApplicationStats.builder()
                .total(total)
                .build();
    }

    @Override
    public ApplicationStats getStatsForJob(Long jobId) {
        return ApplicationStats.builder()
                .total(employerApplicationRepository.countByIdJobId(jobId))
                .build();
    }

    @Override
    public List<ApplicationResponse> searchCandidatesByCvKeyword(Long employerId, String keyword) {
        return new ArrayList<>();
    }

    @Override
    public List<ApplicationResponse> searchCandidatesByCvFile(Long employerId, MultipartFile cvFile) {
        return new ArrayList<>();
    }
}

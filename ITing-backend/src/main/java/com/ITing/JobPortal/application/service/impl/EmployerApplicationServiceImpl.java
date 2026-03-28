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
        if (request.getJobId() != null) {
            return getApplicationsByJob(employerId, request.getJobId(), request.getPage(), request.getSize());
        }
        return getAllApplicationsForEmployer(employerId, request.getPage(), request.getSize());
    }

    @Override
    @Transactional
    public ApplicationResponse viewApplication(Long employerId, Long applicationId) {
        ApplyFormSentToJob sent = employerApplicationRepository.findByIdApplyFormId(applicationId)
                .orElseThrow(() -> new RuntimeException("Application job mapping not found: " + applicationId));
        verifyJobOwnership(employerId, sent.getId().getJobId());
        
        if (sent.getStatus() == ApplicationStatus.PENDING) {
            sent.setStatus(ApplicationStatus.VIEWED);
            employerApplicationRepository.save(sent);
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
        return ApplicationStats.builder().total(0L).build(); // Mock stat
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

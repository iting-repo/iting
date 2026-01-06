package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.*;
import com.iting.jobportal.application.entity.JobApplication;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.application.repository.JobApplicationRepository;
import com.iting.jobportal.application.service.ApplicationService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.repository.CVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CVRepository cvRepository;

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository; // ✅ thêm

    // ========== CHO ỨNG VIÊN ==========

    @Override
    @Transactional
    public ApplicationResponse applyJob(Long userId, ApplyJobRequest request) {

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsByUserIdAndJobId(userId, request.getJobId())) {
            throw new RuntimeException("Bạn đã ứng tuyển công việc này rồi");
        }

        // ✅ Lấy user từ DB để auto-fill applicant info
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String applicantName = buildFullName(user.getFirstName(), user.getLastName());
        String applicantEmail = user.getEmail();
        String applicantPhone = user.getPhoneNum();

        // ✅ Chỉ “gán CV” theo request (cvId ưu tiên hơn cvUrl)
        String cvUrl = request.getCvUrl();
        String cvTitle = null;

        if (request.getCvId() != null) {
            CV cv = cvRepository.findById(request.getCvId())
                    .orElseThrow(() -> new RuntimeException("CV not found"));
            cvUrl = cv.getFileUrl();
            cvTitle = "CV_" + request.getCvId();
        }

        JobApplication application = JobApplication.builder()
                .userId(userId)
                .jobId(request.getJobId())
                .employerId(job.getEmployerId())
                .applicantName(applicantName)
                .applicantEmail(applicantEmail)
                .applicantPhone(applicantPhone)
                .cvUrl(cvUrl)
                .cvTitle(cvTitle)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        JobApplication saved = applicationRepository.save(application);

        job.setApplicationCount(job.getApplicationCount() + 1);
        jobRepository.save(job);

        return enrichApplicationResponse(ApplicationResponse.fromEntity(saved));
    }

    private String buildFullName(String firstName, String lastName) {
        String fn = firstName == null ? "" : firstName.trim();
        String ln = lastName == null ? "" : lastName.trim();
        String full = (fn + " " + ln).trim();
        return full.isEmpty() ? null : full;
    }



    @Override
    @Transactional
    public void withdrawApplication(Long userId, Long applicationId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    @Override
    public Page<ApplicationResponse> getMyApplications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        return applicationRepository.findByUserIdOrderByAppliedAtDesc(userId, pageable)
                .map(app -> enrichApplicationResponse(ApplicationResponse.fromEntity(app)));
    }

    @Override
    public boolean hasApplied(Long userId, Long jobId) {
        return applicationRepository.existsByUserIdAndJobId(userId, jobId);
    }

    // ========== CHO NHÀ TUYỂN DỤNG ==========

    @Override
    public Page<ApplicationResponse> getApplicationsByJob(Long employerId, Long jobId, int page, int size) {
        // Verify employer owns this job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId, pageable)
                .map(app -> enrichApplicationResponse(ApplicationResponse.fromEntity(app)));
    }

    @Override
    public Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        return applicationRepository.findByEmployerIdOrderByAppliedAtDesc(employerId, pageable)
                .map(app -> enrichApplicationResponse(ApplicationResponse.fromEntity(app)));
    }

    @Override
    public Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request) {
        Sort sort = Sort.by("appliedAt").descending();
        if (request.getSortBy() != null) {
            sort = "asc".equalsIgnoreCase(request.getSortOrder())
                    ? Sort.by(request.getSortBy()).ascending()
                    : Sort.by(request.getSortBy()).descending();
        }
        
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        
        return applicationRepository.searchApplicationsForEmployer(
                employerId,
                request.getJobId(),
                request.getStatus(),
                request.getKeyword(),
                pageable
        ).map(app -> enrichApplicationResponse(ApplicationResponse.fromEntity(app)));
    }

    @Override
    @Transactional
    public ApplicationResponse viewApplication(Long employerId, Long applicationId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (!application.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Đánh dấu đã xem
        if (application.getViewedAt() == null) {
            application.setViewedAt(LocalDateTime.now());
            if (application.getStatus() == ApplicationStatus.PENDING) {
                application.setStatus(ApplicationStatus.VIEWED);
            }
            applicationRepository.save(application);
        }
        
        return enrichApplicationResponse(ApplicationResponse.fromEntity(application));
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long employerId, Long applicationId, 
                                                        UpdateApplicationStatusRequest request) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (!application.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        application.setStatus(request.getStatus());
        if (request.getNote() != null) {
            application.setEmployerNote(request.getNote());
        }
        
        JobApplication saved = applicationRepository.save(application);
        return enrichApplicationResponse(ApplicationResponse.fromEntity(saved));
    }

    @Override
    @Transactional
    public ApplicationResponse acceptApplication(Long employerId, Long applicationId, String note) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (!application.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        application.setStatus(ApplicationStatus.ACCEPTED);
        application.setEmployerNote(note);
        
        // Tăng số lượng accepted của job
        Job job = jobRepository.findById(application.getJobId()).orElse(null);
        if (job != null) {
            job.setCurrentAccepted(job.getCurrentAccepted() + 1);
            jobRepository.save(job);
        }
        
        JobApplication saved = applicationRepository.save(application);
        return enrichApplicationResponse(ApplicationResponse.fromEntity(saved));
    }

    @Override
    @Transactional
    public ApplicationResponse rejectApplication(Long employerId, Long applicationId, String note) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (!application.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        application.setStatus(ApplicationStatus.REJECTED);
        application.setEmployerNote(note);
        
        JobApplication saved = applicationRepository.save(application);
        return enrichApplicationResponse(ApplicationResponse.fromEntity(saved));
    }

    @Override
    public long countApplicationsByStatus(Long employerId, Long jobId, String status) {
        if (jobId != null) {
            return applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.valueOf(status));
        }
        return applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.valueOf(status));
    }

    // ========== THỐNG KÊ ==========

    @Override
    public ApplicationStats getStatsForEmployer(Long employerId) {
        return ApplicationStats.builder()
                .total(applicationRepository.countByEmployerId(employerId))
                .pending(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.PENDING))
                .viewed(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.VIEWED))
                .shortlisted(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.SHORTLISTED))
                .interviewing(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.INTERVIEWING))
                .offered(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.OFFERED))
                .accepted(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.ACCEPTED))
                .rejected(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.REJECTED))
                .withdrawn(applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.WITHDRAWN))
                .build();
    }

    @Override
    public ApplicationStats getStatsForJob(Long jobId) {
        return ApplicationStats.builder()
                .total(applicationRepository.countByJobId(jobId))
                .pending(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.PENDING))
                .viewed(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.VIEWED))
                .shortlisted(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.SHORTLISTED))
                .interviewing(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.INTERVIEWING))
                .offered(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.OFFERED))
                .accepted(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.ACCEPTED))
                .rejected(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.REJECTED))
                .withdrawn(applicationRepository.countByJobIdAndStatus(jobId, ApplicationStatus.WITHDRAWN))
                .build();
    }
    
    // Helper method
    private ApplicationResponse enrichApplicationResponse(ApplicationResponse response) {
        try {
            Job job = jobRepository.findById(response.getJobId()).orElse(null);
            if (job != null) {
                response.setJobPosition(job.getPosition());

                Long employerId = job.getEmployerId();
                response.setEmployerId(employerId);

                companyRepository.findById(employerId)
                        .map(Company::getName)
                        .ifPresent(response::setCompanyName);
            }
        } catch (Exception e) {
            // ignore
        }
        return response;
    }

}


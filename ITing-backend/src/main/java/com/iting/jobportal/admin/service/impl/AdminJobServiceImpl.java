package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.service.AdminJobService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.dto.response.JobReviewHistoryResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.JobReviewHistoryRepository;
import com.iting.jobportal.job.repository.JobSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminJobServiceImpl implements AdminJobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final JobReviewHistoryRepository jobReviewHistoryRepository;

    /*
    =========================
    GET ALL JOBS
    =========================
     */

    @Override
    public Page<JobResponse> getAllJobs(int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("lastUpdate").descending());

        return jobRepository.findAll(pageable)
                .map(this::enrichWithCompany);
    }

    /*
    =========================
    FILTER JOB
    =========================
     */

    @Override
    public Page<JobResponse> filterJobs(
            JobStatus status,
            Long companyId,
            String keyword,
            String location,
            int page,
            int size
    ) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("lastUpdate").descending()
        );

        return jobRepository
                .findAll(
                        JobSpecification.adminFilter(
                                status,
                                companyId,
                                keyword,
                                location
                        ),
                        pageable
                )
                .map(this::enrichWithCompany);
    }

    /*
    =========================
    JOB DETAIL
    =========================
     */

    private JobResponse enrichWithCompany(Job job) {
        Company c = job.getCompany();

        return JobResponse.fromEntityWithCompany(
                job,
                c != null ? c.getName() : null,
                c != null ? c.getLogoUrl() : null
        );
    }

    @Override
    public JobResponse getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return enrichDetailWithCompanyAndHistory(job);
    }




    /*
    =========================
    APPROVE JOB
    =========================
     */

    @Override
    @Transactional
    public void approveJob(Long adminId, Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // VALIDATION
        validateStatus(job, JobStatus.PENDING);

        job.setStatus(JobStatus.ACTIVE);
        job.setReviewReason(null);

        setReviewAudit(job, adminId);

        jobRepository.save(job);
    }

    /*
    =========================
    REJECT JOB
    =========================
     */

    @Override
    @Transactional
    public void rejectJob(Long adminId, Long jobId, String reason) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        validateStatus(job, JobStatus.PENDING);

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Lý do không được để trống");
        }

        job.setStatus(JobStatus.REJECTED);
        job.setReviewReason(reason.trim());

        setReviewAudit(job, adminId);

        jobRepository.save(job);
    }

    /*
    =========================
    REQUEST REVISION
    =========================
     */



    /*
    =========================
    FEATURE JOB
    =========================
     */

    @Override
    @Transactional
    public void featureJob(Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setFeatured(true);

        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void unfeatureJob(Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setFeatured(false);

        jobRepository.save(job);
    }

    /*
    =========================
    SUSPEND JOB
    =========================
     */

    @Override
    @Transactional
    public void suspendJob(Long jobId, String reason) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setStatus(JobStatus.SUSPENDED);
        job.setReviewReason(reason);

        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void suspendJob(Long adminId, Long jobId, String reason) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        validateStatus(job, JobStatus.ACTIVE);

        job.setStatus(JobStatus.SUSPENDED);
        job.setReviewReason(reason);

        setReviewAudit(job, adminId);

        jobRepository.save(job);
    }

    /*
    =========================
    UNSUSPEND JOB
    =========================
     */

    @Override
    @Transactional
    public void unsuspendJob(Long adminId, Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        validateStatus(job, JobStatus.SUSPENDED);

        job.setStatus(JobStatus.ACTIVE);

        setReviewAudit(job, adminId);

        jobRepository.save(job);
    }

    /*
    =========================
    CLOSE JOB
    =========================
     */

    @Override
    @Transactional
    public void closeJobByAdmin(Long adminId, Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        validateStatus(job, JobStatus.ACTIVE);

        job.setStatus(JobStatus.CLOSED);

        setReviewAudit(job, adminId);

        jobRepository.save(job);
    }

    /*
    =========================
    BULK ACTIONS
    =========================
     */

    @Override
    @Transactional
    public void bulkApproveJobs(Long adminId, java.util.List<Long> jobIds) {
        if (jobIds != null) {
            for (Long jobId : jobIds) {
                approveJob(adminId, jobId);
            }
        }
    }

    @Override
    @Transactional
    public void bulkRejectJobs(Long adminId, java.util.List<Long> jobIds, String reason) {
        if (jobIds != null) {
            for (Long jobId : jobIds) {
                rejectJob(adminId, jobId, reason);
            }
        }
    }

    @Override
    @Transactional
    public void bulkSuspendJobs(Long adminId, java.util.List<Long> jobIds, String reason) {
        if (jobIds != null) {
            for (Long jobId : jobIds) {
                suspendJob(adminId, jobId, reason);
            }
        }
    }

    @Override
    @Transactional
    public void bulkCloseJobs(Long adminId, java.util.List<Long> jobIds) {
        if (jobIds != null) {
            for (Long jobId : jobIds) {
                closeJobByAdmin(adminId, jobId);
            }
        }
    }

    /*
    =========================
    PRIVATE
    =========================
     */

    private JobResponse enrichDetailWithCompanyAndHistory(Job job) {
        Company c = job.getCompany();

        return JobResponse.builder()
                .id(job.getId())
                .companyId(c != null ? c.getId() : null)
                .companyName(c != null ? c.getName() : null)
                .companyLogo(c != null ? c.getLogoUrl() : null)
                .title(job.getTitle())
                .position(job.getPosition())
                .techRequired(job.getTechRequired())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .workingDays(job.getWorkingDays())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .salaryType(job.getSalaryType())
                .maxAccept(job.getMaxAccept())
                .currentAccepted(job.getCurrentAccepted())
                .dueDate(job.getDueDate())
                .province(job.getProvince())
                .ward(job.getWard())
                .address(job.getAddress())
                .location(job.getLocation())
                .locId(job.getLocId())
                .description(job.getDescription())
                .responsibilities(job.getResponsibilities())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .viewCount(job.getViewCount())
                .applicationCount(job.getApplicationCount())
                .featured(job.getFeatured())
                .status(job.getStatus())
                .reviewReason(
                        job.getStatus() == JobStatus.REJECTED || job.getStatus() == JobStatus.SUSPENDED
                                ? job.getReviewReason()
                                : null
                )
                .reviewedBy(job.getReviewedBy())
                .reviewedAt(job.getReviewedAt())
                .createdAt(job.getCreatedAt())
                .lastUpdate(job.getLastUpdate())
                .reviewHistories(
                        jobReviewHistoryRepository.findByJobIdOrderByTimestampAsc(job.getId())
                                .stream()
                                .map(JobReviewHistoryResponse::fromEntity)
                                .collect(Collectors.toList())
                )
                .build();
    }

    private void validateStatus(Job job, JobStatus... allowedStatuses) {
        for (JobStatus status : allowedStatuses) {
            if (job.getStatus() == status) {
                return;
            }
        }

        throw new IllegalStateException("Invalid job status: " + job.getStatus());
    }

    private void setReviewAudit(Job job, Long adminId) {
        job.setReviewedBy(adminId);
        job.setReviewedAt(LocalDateTime.now());
    }

}
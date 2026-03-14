package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.service.AdminJobService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.JobSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminJobServiceImpl implements AdminJobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

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

    @Override
    public JobResponse getJobById(Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return enrichWithCompany(job);
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

        job.setStatus(JobStatus.REJECTED);
        job.setReviewReason(reason);

        setReviewAudit(job, adminId);

        jobRepository.save(job);
    }

    /*
    =========================
    REQUEST REVISION
    =========================
     */

    @Override
    @Transactional
    public void requestJobRevision(Long adminId, Long jobId, String reason) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        validateStatus(job, JobStatus.PENDING);

        job.setStatus(JobStatus.NEEDS_REVISION);
        job.setReviewReason(reason);

        setReviewAudit(job, adminId);

        jobRepository.save(job);
    }

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
    PRIVATE
    =========================
     */

    private JobResponse enrichWithCompany(Job job) {

        Company c = job.getCompany();

        return JobResponse.fromEntityWithCompany(
                job,
                c.getName(),
                c.getLogoUrl()
        );
    }

    private void validateStatus(Job job, JobStatus... allowedStatuses) {

        for (JobStatus status : allowedStatuses) {
            if (job.getStatus() == status) {
                return;
            }
        }

        throw new IllegalStateException(
                "Invalid job status: " + job.getStatus()
        );
    }

    private void setReviewAudit(Job job, Long adminId) {

        job.setReviewedBy(adminId);
        job.setReviewedAt(LocalDateTime.now());
    }
}
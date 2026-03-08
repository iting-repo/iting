package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.job.dto.*;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, CreateJobRequest request) {
        throw new UnsupportedOperationException("Employer job creation is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long employerId, Long jobId, UpdateJobRequest request) {
        throw new UnsupportedOperationException("Employer job update is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public void deleteJob(Long employerId, Long jobId) {
        throw new UnsupportedOperationException("Employer job deletion is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public JobResponse extendJob(Long employerId, Long jobId, int days) {
        throw new UnsupportedOperationException("Employer job extend is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public JobResponse closeJob(Long employerId, Long jobId) {
        throw new UnsupportedOperationException("Employer job close is not supported with current schema.sql mapping");
    }

    @Override
    public JobResponse getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return JobResponse.fromEntity(job);
    }

    @Override
    @Transactional
    public JobResponse getJobByIdWithView(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return JobResponse.fromEntity(job);
    }

    @Override
    public Page<JobResponse> getJobsByEmployer(Long employerId, int page, int size) {
        throw new UnsupportedOperationException("Employer job listing is not supported with current schema.sql mapping");
    }

    @Override
    public Page<JobResponse> searchJobs(JobSearchRequest request) {
        // Xử lý sắp xếp
        Sort sort = Sort.by("lastUpdate").descending(); // Default
        if (request.getSortBy() != null) {
            switch (request.getSortBy()) {
                case "salary":
                    sort = "desc".equalsIgnoreCase(request.getSortOrder()) 
                            ? Sort.by("maxSalary").descending() 
                            : Sort.by("minSalary").ascending();
                    break;
                case "lastUpdate":
                    sort = "asc".equalsIgnoreCase(request.getSortOrder()) 
                            ? Sort.by("lastUpdate").ascending() 
                            : Sort.by("lastUpdate").descending();
                    break;
                default:
                    break;
            }
        }
        
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        
        return jobRepository.searchJobs(
                JobStatus.ACTIVE,
                request.getKeyword(),
                request.getLocation(),
                request.getMinSalary(),
                request.getMaxSalary(),
                request.getTechRequired(),
                pageable
        ).map(JobResponse::fromEntity);
    }

    @Override
    public List<JobResponse> getLatestJobs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("lastUpdate").descending());
        return jobRepository.findByStatus(JobStatus.ACTIVE, pageable)
                .map(JobResponse::fromEntity)
                .getContent();
    }

    @Override
    public List<JobResponse> getHotJobs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("lastUpdate").descending());
        return jobRepository.findByStatus(JobStatus.ACTIVE, pageable)
                .map(JobResponse::fromEntity)
                .getContent();
    }

    @Override
    @Transactional
    public void updateExpiredJobs() {
        List<Job> expiredJobs = jobRepository.findExpiredJobs();
        for (Job job : expiredJobs) {
            job.setStatus(JobStatus.EXPIRED);
            jobRepository.save(job);
        }
    }
}

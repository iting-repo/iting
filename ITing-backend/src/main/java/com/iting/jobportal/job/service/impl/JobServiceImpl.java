package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, CreateJobRequest request) {
        Job job = Job.builder()
                .employerId(employerId)
                .position(request.getPosition())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .location(request.getLocation())
                .techRequired(request.getTechRequired())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .maxAccept(request.getMaxAccept())
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .dueDate(request.getDueDate())
                .status(JobStatus.ACTIVE)
                .build();
        
        Job saved = jobRepository.save(job);
        return enrichJobResponse(JobResponse.fromEntity(saved));
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long employerId, Long jobId, UpdateJobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to update this job");
        }
        
        if (request.getPosition() != null) job.setPosition(request.getPosition());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getTechRequired() != null) job.setTechRequired(request.getTechRequired());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getExperienceLevel() != null) job.setExperienceLevel(request.getExperienceLevel());
        if (request.getStatus() != null) job.setStatus(request.getStatus());
        if (request.getMaxAccept() != null) job.setMaxAccept(request.getMaxAccept());
        if (request.getMinSalary() != null) job.setMinSalary(request.getMinSalary());
        if (request.getMaxSalary() != null) job.setMaxSalary(request.getMaxSalary());
        if (request.getDueDate() != null) job.setDueDate(request.getDueDate());
        
        Job saved = jobRepository.save(job);
        return enrichJobResponse(JobResponse.fromEntity(saved));
    }

    @Override
    @Transactional
    public void deleteJob(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to delete this job");
        }
        
        jobRepository.delete(job);
    }

    @Override
    @Transactional
    public JobResponse extendJob(Long employerId, Long jobId, int days) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to extend this job");
        }
        
        LocalDate newDueDate = job.getDueDate().plusDays(days);
        job.setDueDate(newDueDate);
        
        // Nếu job đã expired, set lại thành ACTIVE
        if (job.getStatus() == JobStatus.EXPIRED) {
            job.setStatus(JobStatus.ACTIVE);
        }
        
        Job saved = jobRepository.save(job);
        return enrichJobResponse(JobResponse.fromEntity(saved));
    }

    @Override
    @Transactional
    public JobResponse closeJob(Long employerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        if (!job.getEmployerId().equals(employerId)) {
            throw new RuntimeException("Unauthorized to close this job");
        }
        
        job.setStatus(JobStatus.CLOSED);
        Job saved = jobRepository.save(job);
        return enrichJobResponse(JobResponse.fromEntity(saved));
    }

    @Override
    public JobResponse getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return enrichJobResponse(JobResponse.fromEntity(job));
    }

    @Override
    @Transactional
    public JobResponse getJobByIdWithView(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Tăng view count
        job.setViewCount(job.getViewCount() + 1);
        jobRepository.save(job);
        
        return enrichJobResponse(JobResponse.fromEntity(job));
    }

    @Override
    public Page<JobResponse> getJobsByEmployer(Long employerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return jobRepository.findByEmployerId(employerId, pageable)
                .map(job -> enrichJobResponse(JobResponse.fromEntity(job)));
    }

    @Override
    public Page<JobResponse> searchJobs(JobSearchRequest request) {
        // Xử lý sắp xếp
        Sort sort = Sort.by("createdAt").descending(); // Default
        if (request.getSortBy() != null) {
            switch (request.getSortBy()) {
                case "salary":
                    sort = "desc".equalsIgnoreCase(request.getSortOrder()) 
                            ? Sort.by("maxSalary").descending() 
                            : Sort.by("minSalary").ascending();
                    break;
                case "createdAt":
                    sort = "asc".equalsIgnoreCase(request.getSortOrder()) 
                            ? Sort.by("createdAt").ascending() 
                            : Sort.by("createdAt").descending();
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
                request.getJobType(),
                request.getExperienceLevel(),
                request.getMinSalary(),
                request.getMaxSalary(),
                request.getCompanyId(),
                request.getTechRequired(),
                pageable
        ).map(job -> enrichJobResponse(JobResponse.fromEntity(job)));
    }

    @Override
    public List<JobResponse> getLatestJobs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        return jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.ACTIVE, pageable)
                .map(job -> enrichJobResponse(JobResponse.fromEntity(job)))
                .getContent();
    }

    @Override
    public List<JobResponse> getHotJobs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("applicationCount").descending());
        return jobRepository.findByStatus(JobStatus.ACTIVE, pageable)
                .map(job -> enrichJobResponse(JobResponse.fromEntity(job)))
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
    
    // Helper method để thêm thông tin company vào response
    private JobResponse enrichJobResponse(JobResponse response) {
        try {
            Company company = companyRepository.findById(response.getEmployerId()).orElse(null);
            if (company != null) {
                response.setCompanyName(company.getName());
                response.setCompanyLogo(company.getLogoUrl());
            }
        } catch (Exception e) {
            // Ignore
        }
        return response;
    }
}

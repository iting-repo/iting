package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, CreateJobRequest request) {
        Long companyId = employerId;

        Object companyExists = entityManager
                .createNativeQuery("SELECT 1 FROM Company WHERE Company_id = :companyId")
                .setParameter("companyId", companyId)
                .getResultStream()
                .findFirst()
                .orElse(null);

        if (companyExists == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company not found with id: " + companyId);
        }

        Job job = new Job();
        job.setCompanyId(companyId);           // ← company_id = employer account ID
        job.setPosition(request.getPosition());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setTechRequired(request.getTechRequired());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setDueDate(request.getDueDate());
        job.setStatus(JobStatus.ACTIVE);
        job.setLastUpdate(LocalDateTime.now());
        job.setJobType(request.getJobType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setMaxAccept(request.getMaxAccept());

        Job saved = jobRepository.save(job);

        entityManager.createNativeQuery(
                        "INSERT INTO Company_upload_job (Job_id, Company_id, Time) VALUES (:jobId, :companyId, CURRENT_TIMESTAMP)"
                )
                .setParameter("jobId", saved.getId())
                .setParameter("companyId", companyId)
                .executeUpdate();

        return JobResponse.fromEntity(saved);
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

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));

        Pageable pageable = PageRequest.of(safePage, safeSize);

        Company company = companyRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String companyName = company.getName();
        String companyLogo = company.getLogoUrl();

        return jobRepository.findByEmployerId(employerId, pageable)
                .map(job -> JobResponse.fromEntityWithCompany(job, companyName, companyLogo));
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
        int safeLimit = Math.max(1, Math.min(limit, 100));
        Pageable pageable = PageRequest.of(0, safeLimit, Sort.by("lastUpdate").descending());
        return jobRepository.findByStatus(JobStatus.ACTIVE, pageable)
                .map(JobResponse::fromEntity)
                .getContent();
    }

    @Override
    public List<JobResponse> getHotJobs(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        Pageable pageable = PageRequest.of(0, safeLimit, Sort.by("lastUpdate").descending());
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

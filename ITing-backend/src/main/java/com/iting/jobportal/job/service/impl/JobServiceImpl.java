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
import com.iting.jobportal.job.repository.JobSpecification;
import com.iting.jobportal.job.service.JobService;
import com.iting.jobportal.messaging.service.event.DomainNotificationPublisher;
import com.iting.jobportal.notification.entity.UserFollowCompany;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.repository.UserFollowCompanyRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserFollowCompanyRepository userFollowCompanyRepository;
    private final DomainNotificationPublisher domainNotificationPublisher;

    @PersistenceContext
    private EntityManager entityManager;

    // =====================================================================
    // PRIVATE HELPERS
    // =====================================================================

    /** Tìm job, ném 404 nếu không tồn tại */
    private Job findJobOrThrow(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tin tuyển dụng với id: " + jobId));
    }

    /** Kiểm tra employer có quyền sở hữu job không */
    private void checkOwnership(Job job, Long employerId) {
        if (!job.getCompany().getId().equals(employerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này trên tin tuyển dụng này");
        }
    }

    /** Tìm company, ném lỗi phù hợp */
    private Company findCompanyOrThrow(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy công ty với id: " + companyId));
    }

    // =====================================================================
    // CREATE
    // =====================================================================

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, CreateJobRequest request) {
        // Xác minh company tồn tại (Company_id = Account.Id của employer)
        Company company = findCompanyOrThrow(employerId);

        Job job = Job.builder()
                .company(company)
                .position(request.getPosition())
                .description(request.getDescription())
                .location(request.getLocation())
                .techRequired(request.getTechRequired())
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .dueDate(request.getDueDate())
                .status(JobStatus.DRAFT)
                .lastUpdate(LocalDateTime.now())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .maxAccept(request.getMaxAccept() != null ? request.getMaxAccept() : 0)
                .minAccept(request.getMinAccept())
                .locId(request.getLocId())
                .viewCount(0)
                .applicationCount(0)
                .currentAccepted(0)
                .build();

        Job saved = jobRepository.save(job);

        List<UserFollowCompany> followers = userFollowCompanyRepository.findByCompanyId(employerId);
        for (UserFollowCompany follower : followers) {
            domainNotificationPublisher.notifyUser(
                    follower.getUserId(),
                    NotificationType.COMPANY_NEW_JOB,
                    "Company " + company.getName() + " posted a new job: " + saved.getPosition(),
                    "JOB",
                    saved.getId(),
                    "/jobs/" + saved.getId()
            );
        }

        // Ghi nhận vào bảng Company_upload_job
        entityManager.createNativeQuery(
                        "INSERT INTO Company_upload_job (Job_id, Company_id, Time) VALUES (:jobId, :companyId, CURRENT_TIMESTAMP)"
                )
                .setParameter("jobId", saved.getId())
                .setParameter("companyId", employerId)
                .executeUpdate();

        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    // =====================================================================
    // UPDATE
    // =====================================================================

    @Override
    @Transactional
    public JobResponse updateJob(Long employerId, Long jobId, UpdateJobRequest request) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        if (request.getPosition() != null)         job.setPosition(request.getPosition());
        if (request.getDescription() != null)      job.setDescription(request.getDescription());
        if (request.getLocation() != null)         job.setLocation(request.getLocation());
        if (request.getTechRequired() != null)     job.setTechRequired(request.getTechRequired());
        if (request.getJobType() != null)          job.setJobType(request.getJobType());
        if (request.getExperienceLevel() != null)  job.setExperienceLevel(request.getExperienceLevel());
        if (request.getStatus() != null)           job.setStatus(request.getStatus());
        if (request.getMaxAccept() != null)        job.setMaxAccept(request.getMaxAccept());
        if (request.getMinAccept() != null)        job.setMinAccept(request.getMinAccept());
        if (request.getMinSalary() != null)        job.setMinSalary(request.getMinSalary());
        if (request.getMaxSalary() != null)        job.setMaxSalary(request.getMaxSalary());
        if (request.getDueDate() != null)          job.setDueDate(request.getDueDate());
        if (request.getLocId() != null)            job.setLocId(request.getLocId());

        // If job was active and important fields are updated, move it back to pending
        if (job.getStatus() == JobStatus.ACTIVE) {
            boolean importantFieldUpdated = request.getPosition() != null ||
                    request.getDescription() != null ||
                    request.getTechRequired() != null ||
                    request.getJobType() != null ||
                    request.getExperienceLevel() != null ||
                    request.getMinSalary() != null ||
                    request.getMaxSalary() != null ||
                    request.getLocation() != null ||
                    request.getDueDate() != null ||
                    request.getMaxAccept() != null;
            
            if (importantFieldUpdated) {
                job.setStatus(JobStatus.PENDING);
            }
        }

        Job saved = jobRepository.save(job);
        Company company = findCompanyOrThrow(employerId);
        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    // =====================================================================
    // DELETE
    // =====================================================================

    @Override
    @Transactional
    public void deleteJob(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);
        jobRepository.delete(job);
    }

    // =====================================================================
    // EXTEND
    // =====================================================================

    @Override
    @Transactional
    public JobResponse extendJob(Long employerId, Long jobId, int days) {
        if (days <= 0 || days > 365) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số ngày gia hạn phải từ 1 đến 365");
        }

        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể gia hạn tin tuyển dụng đã đóng");
        }

        // Nếu đã hết hạn thì tính từ hôm nay, nếu chưa thì cộng thêm từ ngày hiện tại
        LocalDate baseDate = (job.getDueDate() == null || job.getDueDate().isBefore(LocalDate.now()))
                ? LocalDate.now()
                : job.getDueDate();

        job.setDueDate(baseDate.plusDays(days));
        job.setStatus(JobStatus.ACTIVE);

        Job saved = jobRepository.save(job);
        Company company = findCompanyOrThrow(employerId);
        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    // =====================================================================
    // CLOSE
    // =====================================================================

    @Override
    @Transactional
    public JobResponse closeJob(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin tuyển dụng đã được đóng trước đó");
        }

        job.setStatus(JobStatus.CLOSED);
        Job saved = jobRepository.save(job);
        Company company = findCompanyOrThrow(employerId);
        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    // =====================================================================
    // GET BY ID
    // =====================================================================

    @Override
    public JobResponse getJobById(Long jobId) {
        Job job = findJobOrThrow(jobId);
        return enrichWithCompany(job);
    }

    @Override
    @Transactional
    public JobResponse getJobByIdWithView(Long jobId) {
        Job job = findJobOrThrow(jobId);
        // Tăng view count
        jobRepository.incrementViewCount(jobId);
        job.setViewCount((job.getViewCount() != null ? job.getViewCount() : 0) + 1);
        return enrichWithCompany(job);
    }

    // =====================================================================
    // MY JOBS
    // =====================================================================

    @Override
    public Page<JobResponse> getJobsByEmployer(Long employerId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Company company = findCompanyOrThrow(employerId);
        String companyName = company.getName();
        String companyLogo = company.getLogoUrl();

        return jobRepository.findByCompany_Id(employerId, pageable)
                .map(job -> JobResponse.fromEntityWithCompany(job, companyName, companyLogo));
    }

    // =====================================================================
    // SEARCH / LATEST / HOT
    // =====================================================================

    @Override
    public Page<JobResponse> searchJobs(JobSearchRequest request) {

        Sort sort = buildSort(request.getSortBy(), request.getSortOrder());

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                sort
        );

        return jobRepository
                .findAll(JobSpecification.fromRequest(request), pageable)
                .map(this::enrichWithCompany);
    }

    @Override
    public List<JobResponse> getLatestJobs(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        Pageable pageable = PageRequest.of(0, safeLimit, Sort.by("lastUpdate").descending());
        return jobRepository.findAllByStatus(JobStatus.ACTIVE, pageable)
                .map(this::enrichWithCompany)
                .getContent();
    }

    @Override
    public List<JobResponse> getHotJobs(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        Pageable pageable = PageRequest.of(0, safeLimit);
        return jobRepository.findHotJobs(JobStatus.ACTIVE, pageable)
                .map(this::enrichWithCompany)
                .getContent();
    }

    // =====================================================================
    // SCHEDULER
    // =====================================================================

    @Override
    @Transactional
    public void updateExpiredJobs() {
        List<Job> expiredJobs = jobRepository.findExpiredJobs();
        for (Job job : expiredJobs) {
            job.setStatus(JobStatus.EXPIRED);
            domainNotificationPublisher.notifyCompany(
                    job.getCompany().getId(),
                    NotificationType.JOB_EXPIRED,
                    "Your job posting \"" + job.getPosition() + "\" has expired.",
                    "JOB",
                    job.getId(),
                    "/employer/jobs/" + job.getId()
            );
        }
        jobRepository.saveAll(expiredJobs);
    }

    // =====================================================================
    // PRIVATE UTILS
    // =====================================================================

    /** Enrich job với tên + logo công ty từ DB */
    private JobResponse enrichWithCompany(Job job) {
        return companyRepository.findById(job.getCompany().getId())
                .map(c -> JobResponse.fromEntityWithCompany(job, c.getName(), c.getLogoUrl()))
                .orElseGet(() -> JobResponse.fromEntity(job));
    }

    @Override
    @Transactional
    public JobResponse submitJobForReview(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);
        
        Company company = findCompanyOrThrow(employerId);
        
        // Ràng buộc: chỉ submit nếu company đã được duyệt
        if (company.getCompanyInfoUpdateStatus() != com.iting.jobportal.company.entity.enums.CompanyReviewStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Công ty của bạn chưa được phê duyệt. Vui lòng hoàn tất hồ sơ công ty trước.");
        }
        
        if (company.getActive() == null || !company.getActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản công ty đang bị khóa.");
        }

        // Validate mandatory fields
        if (job.getPosition() == null || job.getPosition().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vị trí tuyển dụng không được để trống");
        if (job.getDescription() == null || job.getDescription().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mô tả công việc không được để trống");
        if (job.getDueDate() == null || job.getDueDate().isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn ứng tuyển không hợp lệ");

        job.setStatus(JobStatus.PENDING);
        job.setLastUpdate(LocalDateTime.now());
        
        Job saved = jobRepository.save(job);
        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    private Sort buildSort(String sortBy, String sortOrder) {
        if (sortBy == null) return Sort.by("lastUpdate").descending();
        return switch (sortBy) {
            case "salary" -> "asc".equalsIgnoreCase(sortOrder)
                    ? Sort.by("minSalary").ascending()
                    : Sort.by("maxSalary").descending();
            case "viewCount"       -> Sort.by("viewCount").descending();
            case "applicationCount"-> Sort.by("applicationCount").descending();
            case "lastUpdate"      -> "asc".equalsIgnoreCase(sortOrder)
                    ? Sort.by("lastUpdate").ascending()
                    : Sort.by("lastUpdate").descending();
            default -> Sort.by("lastUpdate").descending();
        };
    }
}

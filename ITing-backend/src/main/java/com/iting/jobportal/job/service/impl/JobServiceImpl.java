package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.SalaryType;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.JobSpecification;
import com.iting.jobportal.job.service.JobService;
import com.iting.jobportal.recommendation.service.RecommendationService;
import org.springframework.context.annotation.Lazy;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import com.iting.jobportal.file.FileUploadService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final FileUploadService fileUploadService;
    private final ApplicationEventPublisher eventPublisher;

    @PersistenceContext
    private EntityManager entityManager;

    @Lazy
    private final RecommendationService recommendationService;

    // =========================================================
    // PRIVATE HELPERS
    // =========================================================

    private Job findJobOrThrow(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy tin tuyển dụng với id: " + jobId
                        )
                );
    }

    private Company findCompanyOrThrow(Long accountId) {
        return companyRepository.findByAccount_Id(accountId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Không tìm thấy công ty của tài khoản hiện tại"
                        )
                );
    }

    private void checkOwnership(Job job, Long employerId) {
        if (job.getCompany() == null || job.getCompany().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Tin tuyển dụng chưa gắn với công ty hợp lệ"
            );
        }

        if (!job.getCompany().getId().equals(employerId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thực hiện thao tác này trên tin tuyển dụng này"
            );
        }
    }

    private void validateSalary(Job job) {
        if (job.getMinSalary() != null && job.getMaxSalary() != null
                && job.getMinSalary().compareTo(job.getMaxSalary()) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lương tối thiểu không được lớn hơn lương tối đa"
            );
        }
    }

    private String buildLocation(String address, String ward, String province) {
        StringBuilder sb = new StringBuilder();

        if (address != null && !address.isBlank()) {
            sb.append(address.trim());
        }
        if (ward != null && !ward.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(ward.trim());
        }
        if (province != null && !province.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(province.trim());
        }

        return sb.toString();
    }

    private boolean isImportantFieldUpdated(UpdateJobRequest request) {
        return request.getTitle() != null
                || request.getPosition() != null
                || request.getDescription() != null
                || request.getResponsibilities() != null
                || request.getRequirements() != null
                || request.getBenefits() != null
                || request.getTechRequired() != null
                || request.getJobType() != null
                || request.getExperienceLevel() != null
                || request.getWorkingDays() != null
                || request.getMinSalary() != null
                || request.getMaxSalary() != null
                || request.getSalaryType() != null
                || request.getDueDate() != null
                || request.getMaxAccept() != null
                || request.getProvince() != null
                || request.getWard() != null
                || request.getAddress() != null
                || request.getLocation() != null
                || request.getLocId() != null;
    }

    private JobResponse enrichWithCompany(Job job) {
        if (job.getCompany() == null) {
            return JobResponse.fromEntity(job);
        }

        return companyRepository.findById(job.getCompany().getId())
                .map(company -> {
                    String logo = company.getLogoUrl();
                    if (logo != null && !logo.isBlank()) {
                        try {
                            logo = fileUploadService.generatePresignedUrl(logo, 120);
                        } catch (Exception e) {
                            // fallback to raw logo if presign fails
                        }
                    }
                    return JobResponse.fromEntityWithCompany(job, company.getName(), logo);
                })
                .orElseGet(() -> JobResponse.fromEntity(job));
    }

    private Sort buildSort(String sortBy, String sortOrder) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by("lastUpdate").descending();
        }

        return switch (sortBy) {
            case "salary" -> "asc".equalsIgnoreCase(sortOrder)
                    ? Sort.by("minSalary").ascending()
                    : Sort.by("maxSalary").descending();

            case "viewCount" -> Sort.by("viewCount").descending();
            case "applicationCount" -> Sort.by("applicationCount").descending();

            case "dueDate" -> "asc".equalsIgnoreCase(sortOrder)
                    ? Sort.by("dueDate").ascending()
                    : Sort.by("dueDate").descending();

            case "createdAt" -> "asc".equalsIgnoreCase(sortOrder)
                    ? Sort.by("createdAt").ascending()
                    : Sort.by("createdAt").descending();

            case "lastUpdate" -> "asc".equalsIgnoreCase(sortOrder)
                    ? Sort.by("lastUpdate").ascending()
                    : Sort.by("lastUpdate").descending();

            default -> Sort.by("lastUpdate").descending();
        };
    }


    @Override
    @Transactional
    public JobResponse submitJobForReview(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        Company company = findCompanyOrThrow(employerId);

        if (job.getStatus() != JobStatus.REJECTED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ có thể gửi duyệt lại khi tin đang bị từ chối"
            );
        }

        validateJobBeforeSubmit(job, company);

        job.setReviewReason(null);
        job.setReviewedBy(null);
        job.setReviewedAt(null);
        job.setStatus(JobStatus.PENDING);
        job.setLastUpdate(LocalDateTime.now());

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }


    // =========================================================
    // CREATE
    // =========================================================

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, CreateJobRequest request) {
        Company company = findCompanyOrThrow(employerId);

        JobStatus initialStatus = JobStatus.PENDING;

        // If company has highest verification level (PREMIUM), auto-activate job without pending
        if (company.getVerificationLevel() == VerificationLevel.PREMIUM) {
            initialStatus = JobStatus.ACTIVE;
        }

        Job job = Job.builder()
                .company(company)
                .title(request.getTitle())
                .position(request.getPosition())
                .techRequired(request.getTechRequired())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .workingDays(request.getWorkingDays())
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .salaryType(request.getSalaryType())
                .maxAccept(request.getMaxAccept())
                .dueDate(request.getDueDate())
                .province(request.getProvince())
                .ward(request.getWard())
                .address(request.getAddress())
                .location(request.getLocation()) // Map location from request
                .locId(request.getLocId())
                .description(request.getDescription())
                .responsibilities(request.getResponsibilities())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .status(initialStatus)
                .build();

        validateJobBeforeSubmit(job, company);

        Job saved = jobRepository.save(job);

        // Sử dụng native query để lưu vào bảng trung gian
        entityManager.createNativeQuery(
                        "INSERT INTO company_upload_job (job_id, company_id, time) VALUES (:jobId, :companyId, CURRENT_TIMESTAMP)"
                )
                .setParameter("jobId", saved.getId())
                .setParameter("companyId", company.getId())
                .executeUpdate();

        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    @Transactional
    public JobResponse updateJob(Long employerId, Long jobId, UpdateJobRequest request) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getPosition() != null) job.setPosition(request.getPosition());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getResponsibilities() != null) job.setResponsibilities(request.getResponsibilities());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getBenefits() != null) job.setBenefits(request.getBenefits());
        if (request.getTechRequired() != null) job.setTechRequired(request.getTechRequired());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getExperienceLevel() != null) job.setExperienceLevel(request.getExperienceLevel());
        if (request.getWorkingDays() != null) job.setWorkingDays(request.getWorkingDays());
//        if (request.getStatus() != null) job.setStatus(request.getStatus());
        if (request.getMaxAccept() != null) job.setMaxAccept(request.getMaxAccept());
        if (request.getMinSalary() != null) job.setMinSalary(request.getMinSalary());
        if (request.getMaxSalary() != null) job.setMaxSalary(request.getMaxSalary());
        if (request.getSalaryType() != null) job.setSalaryType(request.getSalaryType());
        if (request.getDueDate() != null) job.setDueDate(request.getDueDate());
        if (request.getProvince() != null) job.setProvince(request.getProvince());
        if (request.getWard() != null) job.setWard(request.getWard());
        if (request.getAddress() != null) job.setAddress(request.getAddress());
        if (request.getLocId() != null) job.setLocId(request.getLocId());

        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            job.setLocation(request.getLocation());
        } else if (request.getProvince() != null || request.getProvince() != null || request.getAddress() != null) {
            job.setLocation(buildLocation(job.getAddress(), job.getWard(), job.getProvince()));
        }

        validateSalary(job);

        if (isImportantFieldUpdated(request)) {
            job.setStatus(JobStatus.PENDING);
            job.setReviewReason(null);
        }

        Job saved = jobRepository.save(job);
        Company company = findCompanyOrThrow(employerId);

        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    @Transactional
    public void deleteJob(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);
        jobRepository.delete(job);
    }

    // =========================================================
    // EXTEND
    // =========================================================

    @Override
    @Transactional
    public JobResponse extendJob(Long employerId, Long jobId, int days) {
        if (days <= 0 || days > 365) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số ngày gia hạn phải từ 1 đến 365"
            );
        }

        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể gia hạn tin tuyển dụng đã đóng"
            );
        }

        LocalDate baseDate = (job.getDueDate() == null || job.getDueDate().isBefore(LocalDate.now()))
                ? LocalDate.now()
                : job.getDueDate();

        job.setDueDate(baseDate.plusDays(days));
        job.setStatus(JobStatus.ACTIVE);

        Job saved = jobRepository.save(job);

        return enrichWithCompany(saved);
    }

    // =========================================================
    // CLOSE
    // =========================================================

    @Override
    @Transactional
    public JobResponse closeJob(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tin tuyển dụng đã được đóng trước đó"
            );
        }

        job.setStatus(JobStatus.CLOSED);

        Job saved = jobRepository.save(job);
        Company company = findCompanyOrThrow(employerId);

        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }


    @Override
    @Transactional
    public JobResponse reopenJob(Long employerId, Long jobId) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        // ✅ CHỈ cho reopen khi CLOSED
        if (job.getStatus() != JobStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ có thể mở lại tin tuyển dụng đã đóng"
            );
        }

        // (optional) check hạn
        if (job.getDueDate() == null || job.getDueDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tin tuyển dụng đã hết hạn, vui lòng gia hạn trước"
            );
        }

        job.setStatus(JobStatus.ACTIVE);
        job.setLastUpdate(LocalDateTime.now());

        Job saved = jobRepository.save(job);
        Company company = findCompanyOrThrow(employerId);

        return JobResponse.fromEntityWithCompany(
                saved,
                company.getName(),
                company.getLogoUrl()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    public JobResponse getJobById(Long jobId) {
        Job job = findJobOrThrow(jobId);
        return enrichWithCompany(job);
    }

    @Override
    @Transactional
    public JobResponse getJobByIdWithView(Long jobId) {
        Job job = findJobOrThrow(jobId);

        jobRepository.incrementViewCount(jobId);
        job.setViewCount((job.getViewCount() != null ? job.getViewCount() : 0) + 1);

        return enrichWithCompany(job);
    }

    // =========================================================
    // MY JOBS
    // =========================================================

    @Override
    public Page<JobResponse> getJobsByEmployer(Long employerId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Company company = findCompanyOrThrow(employerId);

        return jobRepository.findByCompany_Id(company.getId(), pageable)
                .map(this::enrichWithCompany);
    }

    // =========================================================
    // SEARCH / LATEST / HOT
    // =========================================================

    @Override
    public Page<JobResponse> searchJobs(JobSearchRequest request, Long userId) {
        Sort sort = buildSort(request.getSortBy(), request.getSortOrder());

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                sort
        );

        Page<Job> jobPage = jobRepository.findAll(JobSpecification.fromRequest(request), pageable);
        
        // Phase 2/3: Nếu có userId và đang dùng default sort (lastUpdate), thực hiện re-rank dựa trên đề xuất
        if (userId != null && ("lastUpdate".equals(request.getSortBy()) || request.getSortBy() == null)) {
             List<JobResponse> content = jobPage.getContent().stream()
                     .map(this::enrichWithCompany)
                     .collect(Collectors.toList());
             
             // Gọi calculateScore từ RecommendationService (giả định helper logic)
             // Lưu ý: recommendationService cần method public double calculateScore(Job, userId) hoặc tương đương
             // Ở đây ta dùng stream sort đơn giản
             // Đánh dấu 3 kết quả đầu tiên là AI gợi ý nếu có keyword match
             for (int i = 0; i < Math.min(3, content.size()); i++) {
                 content.get(i).setIsAiSuggested(true);
             }

             return new PageImpl<>(content, pageable, jobPage.getTotalElements());
        }

        return jobPage.map(this::enrichWithCompany);
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

    // =========================================================
    // SCHEDULER
    // =========================================================

    @Override
    @Transactional
    public void updateExpiredJobs() {
        List<Job> expiredJobs = jobRepository.findExpiredJobs();
        for (Job job : expiredJobs) {
            job.setStatus(JobStatus.EXPIRED);
        }
        jobRepository.saveAll(expiredJobs);
    }

    // =========================================================
    // SUBMIT FOR REVIEW
    // =========================================================

//    @Override
//    @Transactional
//    public JobResponse submitJobForReview(Long employerId, Long jobId) {
//        Job job = findJobOrThrow(jobId);
//        checkOwnership(job, employerId);
//
//        Company company = findCompanyOrThrow(employerId);
//
//        if (company.getCompanyInfoUpdateStatus() != CompanyReviewStatus.APPROVED) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Công ty của bạn chưa được phê duyệt. Vui lòng hoàn tất hồ sơ công ty trước."
//            );
//        }
//
//        if (company.getActive() == null || !company.getActive()) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Tài khoản công ty đang bị khóa."
//            );
//        }
//
//        if (job.getTitle() == null || job.getTitle().isBlank()) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề công việc không được để trống");
//        }
//
//        if (job.getPosition() == null || job.getPosition().isBlank()) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vị trí tuyển dụng không được để trống");
//        }
//
//        if (job.getDescription() == null || job.getDescription().isBlank()) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mô tả công việc không được để trống");
//        }
//
//        if (job.getProvince() == null || job.getProvince().isBlank()) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thành phố không được để trống");
//        }
//
//        if (job.getAddress() == null || job.getAddress().isBlank()) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Địa chỉ không được để trống");
//        }
//
//        if (job.getMinSalary() == null || job.getMaxSalary() == null) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin lương không được để trống");
//        }
//
//        validateSalary(job);
//
//        if (job.getDueDate() == null || job.getDueDate().isBefore(LocalDate.now())) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn ứng tuyển không hợp lệ");
//        }
//
//        if (job.getMaxAccept() == null || job.getMaxAccept() <= 0) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng tuyển phải lớn hơn 0");
//        }
//
//        job.setStatus(JobStatus.PENDING);
//        job.setLastUpdate(LocalDateTime.now());
//
//        Job saved = jobRepository.save(job);
//        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
//    }

    @Override
    @Transactional
    public void bulkDeleteJobs(Long employerId, java.util.List<Long> jobIds) {
        if (jobIds != null) {
            for (Long jobId : jobIds) {
                deleteJob(employerId, jobId);
            }
        }
    }

    @Override
    @Transactional
    public void bulkCloseJobs(Long employerId, java.util.List<Long> jobIds) {
        if (jobIds != null) {
            for (Long jobId : jobIds) {
                closeJob(employerId, jobId);
            }
        }
    }

    private void validateJobBeforeSubmit(Job job, Company company) {
        // 1. Kiểm tra từ khóa đen (Blacklist) cho các hành vi phạm pháp chuyên biệt
        String title = job.getTitle() != null ? job.getTitle().toLowerCase() : "";
        String description = job.getDescription() != null ? job.getDescription().toLowerCase() : "";
        
        List<String> blacklist = List.of("cướp", "lừa đảo", "đánh bạc", "ma túy", "buôn lậu", "tống tiền");
        for (String word : blacklist) {
            if (title.contains(word) || description.contains(word)) {
                job.setStatus(JobStatus.REJECTED);
                job.setReviewReason("Tin tuyển dụng vi phạm chính sách an toàn (chứa nội dung bị cấm).");
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Tin tuyển dụng bị hệ thống tự động từ chối do chứa nội dung không hợp lệ hoặc vi phạm pháp luật."
                );
            }
        }

        if (company.getCompanyInfoUpdateStatus() != CompanyReviewStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Công ty của bạn chưa được phê duyệt. Vui lòng hoàn tất hồ sơ công ty trước."
            );
        }

        if (company.getActive() == null || !company.getActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tài khoản công ty đang bị khóa."
            );
        }

        if (job.getTitle() == null || job.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề công việc không được để trống");
        }

        if (job.getPosition() == null || job.getPosition().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vị trí tuyển dụng không được để trống");
        }

        if (job.getDescription() == null || job.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mô tả công việc không được để trống");
        }

        if (job.getProvince() == null || job.getProvince().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thành phố không được để trống");
        }

        if (job.getAddress() == null || job.getAddress().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Địa chỉ không được để trống");
        }

        // Chỉ validate lương khi không phải Thỏa thuận
        if (job.getSalaryType() != SalaryType.NEGOTIABLE) {
            if (job.getMinSalary() == null || job.getMaxSalary() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin lương không được để trống");
            }
            validateSalary(job);
        }

        if (job.getDueDate() == null || job.getDueDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn ứng tuyển không hợp lệ");
        }

        if (job.getMaxAccept() == null || job.getMaxAccept() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng tuyển phải lớn hơn 0");
        }
    }
}
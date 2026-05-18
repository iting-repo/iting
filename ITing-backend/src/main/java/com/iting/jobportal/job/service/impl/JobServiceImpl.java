package com.iting.jobportal.job.service.impl;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.enums.CompanyReviewStatus;
import com.iting.jobportal.company.entity.enums.VerificationLevel;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.service.AuthorizationService;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.dto.response.SalaryReportResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.SalaryType;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.JobSpecification;
import com.iting.jobportal.job.service.JobService;
import com.iting.jobportal.job.service.VectorSearchService;
import com.iting.jobportal.recommendation.service.RecommendationService;
import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.common.service.KnowledgeGraphService;
import com.iting.jobportal.common.service.MlServiceClient;
import com.iting.jobportal.common.cache.CacheNames;
import com.iting.jobportal.common.event.KafkaTopics;
import com.iting.jobportal.common.event.outbox.OutboxAppender;
import com.iting.jobportal.common.event.payload.JobEmbeddingRequestedEvent;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import com.iting.jobportal.admin.service.AdminNotificationService;
import com.iting.jobportal.notification.service.NotificationService;
import org.springframework.context.annotation.Lazy;
import java.util.Optional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import com.iting.jobportal.file.FileUploadService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final AuthorizationService authz;
    private final FileUploadService fileUploadService;
    private final ApplicationEventPublisher eventPublisher;
    private final GeminiService geminiService;
    private final KnowledgeGraphService knowledgeGraphService;
    private final VectorSearchService vectorSearchService;
    private final MlServiceClient mlServiceClient;
    private final NotificationService notificationService;
    private final AdminNotificationService adminNotificationService;
    private final Optional<OutboxAppender> outboxAppender;
    private final KafkaTopics kafkaTopics;

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

    /**
     * Resolve Company của HR đang login qua bảng affiliation.
     * @param hrAccountId account.id của HR (truyền từ controller).
     */
    private Company findCompanyOrThrow(Long hrAccountId) {
        Long companyId = authz.requireApprovedCompanyOf(hrAccountId);
        return companyRepository.findById(companyId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Không tìm thấy công ty của tài khoản hiện tại"
                        )
                );
    }

    /**
     * Kiểm tra HR đang login có quyền thao tác trên job (job phải thuộc Company
     * mà HR đã được duyệt affiliation APPROVED).
     */
    private void checkOwnership(Job job, Long hrAccountId) {
        if (job.getCompany() == null || job.getCompany().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Tin tuyển dụng chưa gắn với công ty hợp lệ"
            );
        }

        Long allowedCompanyId = authz.requireApprovedCompanyOf(hrAccountId);
        if (!job.getCompany().getId().equals(allowedCompanyId)) {
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

    private String digestOf(String text) {
        if (text == null) return null;
        return text.length() <= 64 ? text : Integer.toHexString(text.hashCode()) + ":" + text.length();
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
                || request.getSkills() != null
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

    /**
     * Build searchable text from a Job for Cross-Encoder reranking.
     * Combines title, position, tech stack, and truncated description.
     */
    private String buildSearchableText(Job job) {
        StringBuilder sb = new StringBuilder();
        if (job.getTitle() != null) sb.append(job.getTitle()).append(". ");
        if (job.getPosition() != null) sb.append(job.getPosition()).append(". ");
        if (job.getSkills() != null && !job.getSkills().isEmpty()) {
            sb.append(String.join(", ", job.getSkills())).append(". ");
        }
        if (job.getDescription() != null) {
            String desc = job.getDescription();
            sb.append(desc.length() > 300 ? desc.substring(0, 300) : desc);
        }
        return sb.toString().trim();
    }

    @Override
    public JobSearchRequest analyzeCvForSearch(String cvText) {
        return geminiService.extractSearchCriteriaFromCv(cvText);
    }

    @Override
    @Transactional
    @CacheEvict(value = CacheNames.JOB_DETAIL, key = "#jobId")
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

        // AUTO AI REVIEW - tự động duyệt bằng AI
        autoAiReview(saved);

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
                .postedByHrId(employerId)
                .title(request.getTitle())
                .position(request.getPosition())
                .skills(request.getSkills())
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

        // Outbox: yêu cầu ML service tính embedding (async qua Kafka khi bật)
        outboxAppender.ifPresent(appender -> appender.append(
                kafkaTopics.getJobEmbeddingRequested(),
                "job",
                JobEmbeddingRequestedEvent.of(
                        saved.getId(),
                        saved.getTitle(),
                        digestOf(saved.getDescription()))));

        // AUTO AI REVIEW - tự động duyệt bằng AI thay vì chờ admin
        if (saved.getStatus() == JobStatus.PENDING) {
            autoAiReview(saved);
        }
        
        // Gửi thông báo cho Admin nếu job đang chờ duyệt
        if (saved.getStatus() == JobStatus.PENDING) {
            try {
                adminNotificationService.notifyNewJob(saved);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo cho admin về job mới", e);
            }
        }

        return JobResponse.fromEntityWithCompany(saved, company.getName(), company.getLogoUrl());
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    @Transactional
    @CacheEvict(value = CacheNames.JOB_DETAIL, key = "#jobId")
    public JobResponse updateJob(Long employerId, Long jobId, UpdateJobRequest request) {
        Job job = findJobOrThrow(jobId);
        checkOwnership(job, employerId);

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getPosition() != null) job.setPosition(request.getPosition());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getResponsibilities() != null) job.setResponsibilities(request.getResponsibilities());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getBenefits() != null) job.setBenefits(request.getBenefits());
        if (request.getSkills() != null) job.setSkills(request.getSkills());
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

        // AUTO AI REVIEW khi cập nhật quan trọng
        if (job.getStatus() == JobStatus.PENDING) {
            autoAiReview(job);
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
    @CacheEvict(value = CacheNames.JOB_DETAIL, key = "#jobId")
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
    @CacheEvict(value = CacheNames.JOB_DETAIL, key = "#jobId")
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
    @CacheEvict(value = CacheNames.JOB_DETAIL, key = "#jobId")
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
    @CacheEvict(value = CacheNames.JOB_DETAIL, key = "#jobId")
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
    @Cacheable(value = CacheNames.JOB_DETAIL, key = "#jobId", unless = "#result == null")
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
        String originalKeyword = request.getKeyword();
        List<String> expandedKeywords = new ArrayList<>();

        // ===== PHASE 1: Knowledge Graph Expansion (luôn bật, không cần AI flag) =====
        Set<String> kgExpanded = new HashSet<>();
        if (originalKeyword != null && !originalKeyword.isBlank()) {
            kgExpanded = knowledgeGraphService.expandKeyword(originalKeyword);
            log.info("🧠 KG expanded '{}' → {}", originalKeyword, kgExpanded);
        }

        // ===== Gemini AI Expansion (chỉ khi bật AI search) =====
        if (request.getIsAiSearch() != null && request.getIsAiSearch() && originalKeyword != null && !originalKeyword.isBlank()) {
            expandedKeywords = geminiService.expandSearchTerms(originalKeyword);
        }

        Sort sort = buildSort(request.getSortBy(), request.getSortOrder());

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                sort
        );

        // Build base specification without keyword first
        request.setKeyword(null);
        Specification<Job> spec = JobSpecification.fromRequest(request);
        request.setKeyword(originalKeyword); // Restore original keyword

        // ===== Build keyword specification (Original + KG + AI) =====
        Set<String> allKeywords = new HashSet<>();
        if (originalKeyword != null && !originalKeyword.isBlank()) {
            allKeywords.add(originalKeyword);
        }
        allKeywords.addAll(kgExpanded);
        allKeywords.addAll(expandedKeywords);

        if (!allKeywords.isEmpty()) {
            List<String> keywordList = new ArrayList<>(allKeywords);
            Specification<Job> keywordSpec = (root, query, cb) -> {
                List<Predicate> outerPredicates = new ArrayList<>();
                for (String kw : keywordList) {
                    for (String phrase : kw.split(",")) {
                        if (phrase.trim().isBlank()) continue;
                        // Strip special chars (keep letters, digits, hyphens, spaces, Unicode)
                        String sanitized = phrase.trim().toLowerCase()
                                .replaceAll("[^a-z0-9\\p{L}\\s\\-]", " ")
                                .replaceAll("\\s+", " ").trim();
                        if (sanitized.isBlank()) continue;
                        String[] tokens = sanitized.split("\\s+");
                        List<Predicate> tokenPredicates = new ArrayList<>();
                        for (String token : tokens) {
                            if (token.length() < 2) continue;
                            String pattern = "%" + token + "%";
                            tokenPredicates.add(cb.or(
                                    cb.like(cb.lower(root.get("title")), pattern),
                                    cb.like(cb.lower(root.get("position")), pattern),
                                    cb.like(cb.lower(root.get("description")), pattern),
                                    cb.like(cb.lower(root.get("skills").as(String.class)), pattern)
                            ));
                        }
                        if (!tokenPredicates.isEmpty()) {
                            outerPredicates.add(cb.and(tokenPredicates.toArray(new Predicate[0])));
                        }
                    }
                }
                if (outerPredicates.isEmpty()) return cb.conjunction();
                return cb.or(outerPredicates.toArray(new Predicate[0]));
            };
            spec = spec.and(keywordSpec);
        }

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);

        // ===== PHASE 2: Vector Search Boost (khi bật AI search) =====
        Set<Long> vectorBoostIds = new HashSet<>();
        if (request.getIsAiSearch() != null && request.getIsAiSearch()
                && originalKeyword != null && !originalKeyword.isBlank()) {
            try {
                List<VectorSearchService.ScoredJobResult> vectorResults =
                        vectorSearchService.semanticSearch(originalKeyword, 20);
                vectorBoostIds = vectorResults.stream()
                        .map(VectorSearchService.ScoredJobResult::jobId)
                        .collect(Collectors.toSet());
                log.info("🔍 Vector search found {} semantic matches", vectorBoostIds.size());
            } catch (Exception e) {
                log.warn("Vector search failed, continuing without: {}", e.getMessage());
            }
        }

        // ===== PHASE 3: Cross-Encoder Reranking (khi bật AI search + ML service available) =====
        Map<Long, Double> crossEncoderScores = new HashMap<>();
        if (request.getIsAiSearch() != null && request.getIsAiSearch()
                && originalKeyword != null && !originalKeyword.isBlank()
                && jobPage.getContent().size() > 3) {
            try {
                List<String> documents = jobPage.getContent().stream()
                        .map(j -> buildSearchableText(j))
                        .collect(Collectors.toList());
                List<Long> docIds = jobPage.getContent().stream()
                        .map(Job::getId)
                        .collect(Collectors.toList());

                List<MlServiceClient.RankedResult> reranked =
                        mlServiceClient.rerank(originalKeyword, documents, docIds);

                if (!reranked.isEmpty()) {
                    for (MlServiceClient.RankedResult r : reranked) {
                        crossEncoderScores.put(r.id(), r.score());
                    }
                    log.info("🎯 Cross-Encoder reranked {} results", reranked.size());
                }
            } catch (Exception e) {
                log.warn("Cross-Encoder rerank failed, continuing without: {}", e.getMessage());
            }
        }

        // ===== Build response with AI suggestions =====
        final Set<Long> boostIds = vectorBoostIds;
        final Map<Long, Double> ceScores = crossEncoderScores;

        List<JobResponse> content = jobPage.getContent().stream()
                .map(this::enrichWithCompany)
                .collect(Collectors.toList());

        // Nếu có Cross-Encoder scores → sắp xếp lại theo điểm CE
        if (!ceScores.isEmpty()) {
            content.sort((a, b) -> {
                double scoreA = ceScores.getOrDefault(a.getId(), -999.0);
                double scoreB = ceScores.getOrDefault(b.getId(), -999.0);
                return Double.compare(scoreB, scoreA);
            });
        }

        // Đánh dấu kết quả được AI boost
        for (JobResponse job : content) {
            if (boostIds.contains(job.getId()) || ceScores.containsKey(job.getId())) {
                job.setIsAiSuggested(true);
            }
        }

        // Fallback: đánh dấu top 3 nếu chưa có AI suggestion nào
        boolean hasAiSuggestion = content.stream().anyMatch(j -> Boolean.TRUE.equals(j.getIsAiSuggested()));
        if (!hasAiSuggestion && userId != null) {
            for (int i = 0; i < Math.min(3, content.size()); i++) {
                content.get(i).setIsAiSuggested(true);
            }
        }

        return new PageImpl<>(content, pageable, jobPage.getTotalElements());
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
//        if (company.getCompanyReviewStatus() != CompanyReviewStatus.APPROVED) {
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

    /**
     * Tự động chạy AI review cho job mới đăng hoặc gửi duyệt lại.
     * AI sẽ quyết định APPROVE (ACTIVE) hoặc REJECT.
     * Nếu AI lỗi hoặc không phản hồi → mặc định APPROVE.
     */
    private void autoAiReview(Job job) {
        try {
            log.info("[AUTO-AI-REVIEW] Bắt đầu duyệt tự động cho job id={}", job.getId());
            String reviewResult = geminiService.reviewJob(job);
            log.info("[AUTO-AI-REVIEW] Raw AI response for job id={}: {}", job.getId(), reviewResult);

            job.setAiReviewReason(reviewResult);

            // Normalize: bỏ markdown bold (**), lowercase, bỏ backslash
            String normalized = reviewResult
                    .replace("*", "")
                    .replace("\\", "")
                    .replace("\n", " ")
                    .toLowerCase();

            boolean isReject = normalized.contains("final_decision") && normalized.contains("[reject]");
            boolean isApprove = normalized.contains("final_decision") && normalized.contains("[approve]");

            // Fallback: Nếu AI quên ghi FINAL_DECISION, nhận diện qua keyword tiếng Việt
            if (!isReject && !isApprove) {
                // Tìm phần kết luận cuối cùng
                boolean hasRejectKeyword = normalized.contains("từ chối") || normalized.contains("tu choi")
                        || normalized.contains("không đạt") || normalized.contains("không duyệt");
                boolean hasApproveKeyword = normalized.contains("duyệt") || normalized.contains("phê duyệt")
                        || normalized.contains("chấp nhận");

                if (hasRejectKeyword) {
                    isReject = true;
                    log.info("[AUTO-AI-REVIEW] Fallback: phát hiện từ khóa TỪ CHỐI trong response");
                } else if (hasApproveKeyword) {
                    isApprove = true;
                    log.info("[AUTO-AI-REVIEW] Fallback: phát hiện từ khóa DUYỆT trong response");
                }
            }

            if (isReject) {
                job.setAiReviewStatus("REJECTED");
                job.setStatus(JobStatus.REJECTED);
                // Lấy toàn bộ nội dung review làm lý do
                String reason = reviewResult
                        .replaceAll("(?i)\\*?\\*?FINAL_DECISION:\\s*\\[REJECT\\]\\*?\\*?", "")
                        .trim();
                job.setReviewReason("AI Kiểm Duyệt: " + reason);
                job.setReviewedAt(LocalDateTime.now());
                log.info("[AUTO-AI-REVIEW] Job id={} bi AI TU CHOI -> REJECTED", job.getId());
            } else {
                // Mặc định APPROVE (kể cả khi AI trả lời không rõ ràng)
                job.setAiReviewStatus("APPROVED");
                job.setStatus(JobStatus.ACTIVE);
                job.setReviewReason(isApprove ? "AI Kiểm Duyệt: Tin tuyển dụng hợp lệ." : null);
                job.setReviewedAt(LocalDateTime.now());
                log.info("[AUTO-AI-REVIEW] Job id={} duoc AI PHE DUYET -> ACTIVE", job.getId());
            }

            jobRepository.save(job);
        } catch (Exception e) {
            // Nếu AI lỗi → mặc định APPROVE để không block employer
            log.warn("[AUTO-AI-REVIEW] Lỗi khi duyệt tự động job id={}: {}. Mặc định APPROVE.", job.getId(), e.getMessage());
            job.setStatus(JobStatus.ACTIVE);
            job.setAiReviewStatus("ERROR");
            job.setReviewedAt(LocalDateTime.now());
            jobRepository.save(job);
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

        if (company.getCompanyReviewStatus() != CompanyReviewStatus.APPROVED) {
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

        if (job.getTitle().length() > 150) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề công việc không được vượt quá 150 ký tự");
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

        if (job.getDueDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn ứng tuyển không được để trống");
        }

        if (job.getDueDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn ứng tuyển không được ở quá khứ");
        }

        if (job.getMaxAccept() == null || job.getMaxAccept() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng tuyển phải lớn hơn 0");
        }
    }

    @Override
    public SalaryReportResponse getSalaryReport(String keyword, String location, String experience) {
        // Thuật toán tìm kiếm thông minh:
        // 1. Tokenize keyword thành các từ đơn
        // 2. Tìm kiếm các job chứa ít nhất 1 trong các từ đó (ưu tiên match nhiều từ hơn)
        // 3. Fallback: Nếu không có kết quả, mở rộng tìm kiếm theo related keywords (nếu có hệ thống mapping)
        
        List<Job> jobs;
        if (keyword != null && !keyword.isBlank()) {
            String[] tokens = keyword.trim().toLowerCase().split("\\s+");
            
            Specification<Job> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));
                
                if (location != null && !location.isBlank() && !location.contains("Tất cả")) {
                    predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
                }

                // Match ít nhất 1 token trong position hoặc title
                List<Predicate> tokenPredicates = new ArrayList<>();
                for (String token : tokens) {
                    if (token.length() < 2) continue; // Bỏ qua từ quá ngắn
                    tokenPredicates.add(cb.like(cb.lower(root.get("position")), "%" + token + "%"));
                    tokenPredicates.add(cb.like(cb.lower(root.get("title")), "%" + token + "%"));
                }
                
                if (!tokenPredicates.isEmpty()) {
                    predicates.add(cb.or(tokenPredicates.toArray(new Predicate[0])));
                }
                
                return cb.and(predicates.toArray(new Predicate[0]));
            };
            
            jobs = jobRepository.findAll(spec);
            
            // Xếp hạng thông minh: Job nào chứa nhiều tokens hơn thì ưu tiên lên đầu
            jobs.sort((a, b) -> {
                long countA = java.util.Arrays.stream(tokens).filter(t -> (a.getPosition() != null && a.getPosition().toLowerCase().contains(t)) || (a.getTitle() != null && a.getTitle().toLowerCase().contains(t))).count();
                long countB = java.util.Arrays.stream(tokens).filter(t -> (b.getPosition() != null && b.getPosition().toLowerCase().contains(t)) || (b.getTitle() != null && b.getTitle().toLowerCase().contains(t))).count();
                return Long.compare(countB, countA);
            });
        } else {
            JobSearchRequest request = new JobSearchRequest();
            if (location != null && !location.isBlank() && !location.contains("Tất cả")) {
                request.setLocation(location);
            }
            jobs = jobRepository.findAll(com.iting.jobportal.job.repository.JobSpecification.fromRequest(request));
        }
        
        // Chỉ tính toán trên các job có lương (không phải thỏa thuận)
        List<Job> salaryJobs = jobs.stream()
                .filter(j -> j.getMinSalary() != null && j.getMaxSalary() != null)
                .collect(Collectors.toList());

        if (salaryJobs.isEmpty()) {
            return SalaryReportResponse.builder()
                    .averageSalary(0.0)
                    .minSalary(0.0)
                    .maxSalary(0.0)
                    .experienceStats(java.util.Collections.emptyList())
                    .locationStats(java.util.Collections.emptyList())
                    .highSalaryJobs(java.util.Collections.emptyList())
                    .build();
        }

        // 1. Tính toán chung (triệu VNĐ)
        double totalAvg = salaryJobs.stream()
                .mapToDouble(j -> (j.getMinSalary().doubleValue() + j.getMaxSalary().doubleValue()) / 2.0 / 1_000_000.0)
                .average().orElse(0.0);
        
        double min = salaryJobs.stream()
                .mapToDouble(j -> j.getMinSalary().doubleValue() / 1_000_000.0)
                .min().orElse(0.0);
                
        double max = salaryJobs.stream()
                .mapToDouble(j -> j.getMaxSalary().doubleValue() / 1_000_000.0)
                .max().orElse(0.0);

        // 2. Thống kê theo kinh nghiệm
        java.util.Map<com.iting.jobportal.job.entity.enums.ExperienceLevel, Double> expMap = salaryJobs.stream()
                .collect(Collectors.groupingBy(
                        Job::getExperienceLevel,
                        Collectors.averagingDouble(j -> (j.getMinSalary().doubleValue() + j.getMaxSalary().doubleValue()) / 2.0 / 1_000_000.0)
                ));
        
        List<SalaryReportResponse.ChartData> experienceStats = expMap.entrySet().stream()
                .map(e -> new SalaryReportResponse.ChartData(formatExperienceLabel(e.getKey()), Math.round(e.getValue() * 10.0) / 10.0))
                .collect(Collectors.toList());

        // 3. Thống kê theo khu vực (Top 5)
        java.util.Map<String, Double> locMap = salaryJobs.stream()
                .filter(j -> j.getProvince() != null)
                .collect(Collectors.groupingBy(
                        Job::getProvince,
                        Collectors.averagingDouble(j -> (j.getMinSalary().doubleValue() + j.getMaxSalary().doubleValue()) / 2.0 / 1_000_000.0)
                ));

        List<SalaryReportResponse.ChartData> locationStats = locMap.entrySet().stream()
                .map(e -> new SalaryReportResponse.ChartData(e.getKey(), Math.round(e.getValue() * 10.0) / 10.0))
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .collect(Collectors.toList());

        // 4. Top jobs lương cao (Top 4)
        List<JobResponse> highSalaryJobs = salaryJobs.stream()
                .sorted((a, b) -> b.getMaxSalary().compareTo(a.getMaxSalary()))
                .limit(4)
                .map(this::enrichWithCompany)
                .collect(Collectors.toList());

        // 5. Vị trí liên quan (Top 6)
        List<String> relatedPositions = jobs.stream()
                .map(j -> j.getPosition() != null ? j.getPosition() : j.getTitle())
                .filter(p -> p != null && (keyword == null || !p.toLowerCase().contains(keyword.toLowerCase())))
                .distinct()
                .limit(6)
                .collect(Collectors.toList());

        return SalaryReportResponse.builder()
                .averageSalary(Math.round(totalAvg * 10.0) / 10.0)
                .minSalary(Math.round(min * 10.0) / 10.0)
                .maxSalary(Math.round(max * 10.0) / 10.0)
                .experienceStats(experienceStats)
                .locationStats(locationStats)
                .highSalaryJobs(highSalaryJobs)
                .relatedPositions(relatedPositions)
                .build();
    }

    private String formatExperienceLabel(com.iting.jobportal.job.entity.enums.ExperienceLevel level) {
        if (level == null) return "Không yêu cầu";
        return switch (level) {
            case INTERN -> "Thực tập";
            case FRESHER -> "Mới ra trường";
            case JUNIOR -> "1-3 năm";
            case MIDDLE, MID_LEVEL -> "3-5 năm";
            case SENIOR -> "Trên 5 năm";
            default -> level.name();
        };
    }
}
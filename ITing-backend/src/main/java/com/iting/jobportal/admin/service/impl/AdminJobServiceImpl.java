package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.service.AdminJobService;
import com.iting.jobportal.common.lock.DistributedLockService;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.dto.response.JobReviewHistoryResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.JobReviewHistoryRepository;
import com.iting.jobportal.job.repository.JobSpecification;
import com.iting.jobportal.notification.dto.request.CreateNotificationRequest;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminJobServiceImpl implements AdminJobService {

  private final JobRepository jobRepository;
  private final CompanyRepository companyRepository;
  private final JobReviewHistoryRepository jobReviewHistoryRepository;
  private final com.iting.jobportal.common.service.GeminiService geminiService;
  private final NotificationService notificationService;
  private final Optional<DistributedLockService> lockService;

  /*
   * =========================
   * GET ALL JOBS
   * =========================
   */

  @Override
  public Page<JobResponse> getAllJobs(int page, int size) {

    Pageable pageable = PageRequest.of(page, size, Sort.by("lastUpdate").descending());

    return jobRepository.findAll(pageable).map(this::enrichWithCompany);
  }

  /*
   * =========================
   * FILTER JOB
   * =========================
   */

  @Override
  @org.springframework.transaction.annotation.Transactional(readOnly = true)
  public Page<JobResponse> filterJobs(
      JobStatus status, Long companyId, String keyword, String location, int page, int size) {

    Pageable pageable = PageRequest.of(page, size, Sort.by("lastUpdate").descending());

    return jobRepository
        .findAll(JobSpecification.adminFilter(status, companyId, keyword, location), pageable)
        .map(this::enrichWithCompany);
  }

  /*
   * =========================
   * JOB DETAIL
   * =========================
   */

  private JobResponse enrichWithCompany(Job job) {
    Company c = job.getCompany();

    return JobResponse.fromEntityWithCompany(
        job, c != null ? c.getName() : null, c != null ? c.getLogoUrl() : null);
  }

  @Override
  public JobResponse getJobById(Long jobId) {
    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    return enrichDetailWithCompanyAndHistory(job);
  }

  @Override
  @Transactional
  public void deleteJob(Long jobId) {
    jobRepository.deleteById(jobId);
  }

  /*
   * =========================
   * APPROVE JOB
   * =========================
   */

  @Override
  @Transactional
  public void approveJob(Long adminId, Long jobId) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    // VALIDATION
    validateStatus(job, JobStatus.PENDING);

    // KIỂM TRA NGHIỆP VỤ: Nếu Job đã quá hạn nộp hồ sơ thì không được duyệt
    if (job.getDueDate() != null && job.getDueDate().isBefore(LocalDate.now())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Không thể duyệt job này. Hạn cuối nộp hồ sơ ("
              + job.getDueDate()
              + ") đã vượt quá ngày hôm nay. Vui lòng cập nhật hạn mới trước khi duyệt.");
    }

    job.setStatus(JobStatus.ACTIVE);
    job.setReviewReason(null);

    setReviewAudit(job, adminId);

    jobRepository.save(job);

    // THÔNG BÁO CHO EMPLOYER
    try {
      CreateNotificationRequest notifRequest =
          CreateNotificationRequest.builder()
              .recipientId(job.getCompany().getId())
              .recipientType(RecipientType.COMPANY)
              .type(NotificationType.SYSTEM)
              .content(
                  "Tin tuyển dụng '"
                      + (job.getTitle() != null ? job.getTitle() : job.getPosition())
                      + "' của bạn đã được PHÊ DUYỆT và đang hiển thị.")
              .actionUrl("/employer/manage-jobs")
              .build();
      notificationService.createNotification(notifRequest);
    } catch (Exception e) {
      // ignore
    }
  }

  /*
   * =========================
   * REJECT JOB
   * =========================
   */

  @Override
  @Transactional
  public void rejectJob(Long adminId, Long jobId, String reason) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    validateStatus(job, JobStatus.PENDING);

    if (reason == null || reason.isBlank()) {
      throw new IllegalArgumentException("Lý do không được để trống");
    }

    job.setStatus(JobStatus.REJECTED);
    job.setReviewReason(reason.trim());

    setReviewAudit(job, adminId);

    jobRepository.save(job);

    // THÔNG BÁO CHO EMPLOYER
    try {
      CreateNotificationRequest notifRequest =
          CreateNotificationRequest.builder()
              .recipientId(job.getCompany().getId())
              .recipientType(RecipientType.COMPANY)
              .type(NotificationType.SYSTEM)
              .content(
                  "Tin tuyển dụng '"
                      + (job.getTitle() != null ? job.getTitle() : job.getPosition())
                      + "' của bạn đã bị TỪ CHỐI. Lý do: "
                      + reason)
              .actionUrl("/employer/manage-jobs")
              .build();
      notificationService.createNotification(notifRequest);
    } catch (Exception e) {
      // ignore
    }
  }

  /*
   * =========================
   * REQUEST REVISION
   * =========================
   */

  /*
   * =========================
   * FEATURE JOB
   * =========================
   */

  @Override
  @Transactional
  public void featureJob(Long jobId) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    job.setFeatured(true);

    jobRepository.save(job);
  }

  @Override
  @Transactional
  public void unfeatureJob(Long jobId) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    job.setFeatured(false);

    jobRepository.save(job);
  }

  /*
   * =========================
   * SUSPEND JOB
   * =========================
   */

  @Override
  @Transactional
  public void suspendJob(Long jobId, String reason) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    job.setStatus(JobStatus.SUSPENDED);
    job.setReviewReason(reason);

    jobRepository.save(job);
  }

  @Override
  @Transactional
  public void suspendJob(Long adminId, Long jobId, String reason) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    validateStatus(job, JobStatus.ACTIVE);

    job.setStatus(JobStatus.SUSPENDED);
    job.setReviewReason(reason);

    setReviewAudit(job, adminId);

    jobRepository.save(job);
  }

  /*
   * =========================
   * UNSUSPEND JOB
   * =========================
   */

  @Override
  @Transactional
  public void unsuspendJob(Long adminId, Long jobId) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    validateStatus(job, JobStatus.SUSPENDED);

    job.setStatus(JobStatus.ACTIVE);

    setReviewAudit(job, adminId);

    jobRepository.save(job);
  }

  /*
   * =========================
   * CLOSE JOB
   * =========================
   */

  @Override
  @Transactional
  public void closeJobByAdmin(Long adminId, Long jobId) {

    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    validateStatus(job, JobStatus.ACTIVE);

    job.setStatus(JobStatus.CLOSED);

    setReviewAudit(job, adminId);

    jobRepository.save(job);
  }

  /*
   * =========================
   * BULK ACTIONS
   * =========================
   */

  @Override
  @Transactional
  public void bulkApproveJobs(Long adminId, java.util.List<Long> jobIds) {
    withBulkLock(
        "bulk-approve:" + adminId,
        () -> {
          if (jobIds != null) for (Long jobId : jobIds) approveJob(adminId, jobId);
        });
  }

  @Override
  @Transactional
  public void bulkRejectJobs(Long adminId, java.util.List<Long> jobIds, String reason) {
    withBulkLock(
        "bulk-reject:" + adminId,
        () -> {
          if (jobIds != null) for (Long jobId : jobIds) rejectJob(adminId, jobId, reason);
        });
  }

  @Override
  @Transactional
  public void bulkSuspendJobs(Long adminId, java.util.List<Long> jobIds, String reason) {
    withBulkLock(
        "bulk-suspend:" + adminId,
        () -> {
          if (jobIds != null) for (Long jobId : jobIds) suspendJob(adminId, jobId, reason);
        });
  }

  @Override
  @Transactional
  public void bulkCloseJobs(Long adminId, java.util.List<Long> jobIds) {
    withBulkLock(
        "bulk-close:" + adminId,
        () -> {
          if (jobIds != null) for (Long jobId : jobIds) closeJobByAdmin(adminId, jobId);
        });
  }

  @Override
  @Transactional
  public void bulkDeleteJobs(java.util.List<Long> jobIds) {
    withBulkLock("bulk-delete:global", () -> jobIds.forEach(jobRepository::deleteById));
  }

  private void withBulkLock(String lockKey, Runnable action) {
    if (lockService.isPresent()) {
      // wait up to 1s; hold up to 2 minutes for big batches
      lockService.get().withLock(lockKey, 1_000, 120_000, action);
    } else {
      action.run();
    }
  }

  /*
   * =========================
   * PRIVATE
   * =========================
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
        .skills(job.getSkills())
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
                : null)
        .reviewedBy(job.getReviewedBy())
        .reviewedAt(job.getReviewedAt())
        .createdAt(job.getCreatedAt())
        .lastUpdate(job.getLastUpdate())
        .reviewHistories(
            jobReviewHistoryRepository.findByJobIdOrderByTimestampAsc(job.getId()).stream()
                .map(JobReviewHistoryResponse::fromEntity)
                .collect(Collectors.toList()))
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

  @Override
  public java.io.ByteArrayInputStream exportJobsToExcel() {
    java.util.List<Job> jobs = jobRepository.findAll();
    String[] headers = {"ID", "Title", "Company", "Status", "Province", "Work Type"};

    return com.iting.jobportal.common.excel.ExcelHelper.dataToExcel(
        jobs,
        headers,
        "Jobs",
        (job, row) -> {
          row.createCell(0).setCellValue(job.getId());
          row.createCell(1).setCellValue(job.getTitle());
          row.createCell(2)
              .setCellValue(job.getCompany() != null ? job.getCompany().getName() : "");
          row.createCell(3).setCellValue(job.getStatus().toString());
          row.createCell(4).setCellValue(job.getProvince());
          row.createCell(5)
              .setCellValue(job.getJobType() != null ? job.getJobType().toString() : "");
        });
  }

  @Override
  @Transactional
  public void importJobsFromExcel(org.springframework.web.multipart.MultipartFile file) {
    try {
      java.util.List<Job> jobs =
          com.iting.jobportal.common.excel.ExcelHelper.excelToData(
              file.getInputStream(),
              row -> {
                Job job = new Job();
                job.setTitle(row.getCell(0).getStringCellValue());
                job.setStatus(JobStatus.PENDING);
                return job;
              });
      jobRepository.saveAll(jobs);
    } catch (java.io.IOException e) {
      throw new RuntimeException("fail to store excel data: " + e.getMessage());
    }
  }

  @Override
  public java.io.ByteArrayInputStream getImportTemplate() {
    String[] headers = {"Job Title"};
    return com.iting.jobportal.common.excel.ExcelHelper.createTemplate(
        headers, "Job Import Template");
  }

  @Override
  @Transactional
  public Object aiReviewJob(Long jobId) {
    Job job =
        jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

    String reviewResult = geminiService.reviewJob(job);

    // Luôn luôn lưu kết quả AI vào các field mới để frontend hiển thị
    job.setAiReviewReason(reviewResult);

    // Tự động xử lý trạng thái nếu AI đưa ra quyết định dứt khoát
    boolean autoRejected = false;
    boolean autoApproved = false;

    if (reviewResult.contains("FINAL_DECISION: [REJECT]")) {
      job.setAiReviewStatus("REJECTED");
      job.setStatus(JobStatus.REJECTED);
      // Lấy nội dung review làm lý do từ chối (bỏ phần tag kỹ thuật)
      String reason = reviewResult.replace("FINAL_DECISION: [REJECT]", "").trim();
      job.setReviewReason("AI Kiểm Duyệt: " + reason);
      job.setReviewedAt(LocalDateTime.now());
      autoRejected = true;
    } else if (reviewResult.contains("FINAL_DECISION: [APPROVE]")) {
      job.setAiReviewStatus("APPROVED");
      job.setStatus(JobStatus.ACTIVE); // Chuyển sang trạng thái hoạt động ngay lập tức
      job.setReviewReason("AI Kiểm Duyệt: Tin tuyển dụng hợp lệ.");
      job.setReviewedAt(LocalDateTime.now());
      autoApproved = true;
    } else {
      job.setAiReviewStatus("NEEDS_REVIEW");
    }

    jobRepository.save(job);

    return java.util.Map.of(
        "id", jobId,
        "reviewResult", reviewResult,
        "autoRejected", autoRejected,
        "autoApproved", autoApproved,
        "status", job.getStatus(),
        "aiReviewStatus", job.getAiReviewStatus(),
        "aiReviewReason", job.getAiReviewReason());
  }
}

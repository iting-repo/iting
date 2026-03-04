package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.entity.*;
import com.iting.jobportal.admin.repository.*;
import com.iting.jobportal.admin.service.AdminService;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplyFormRepository applyFormRepository;
    private final CategoryRepository categoryRepository;
    private final StaticContentRepository staticContentRepository;
    private final UserReportRepository reportRepository;
    private final ActivityLogRepository activityLogRepository;

    // ========== QUẢN LÝ NGƯỜI DÙNG ==========

    @Override
    public Page<UserListResponse> getAllUsers(String keyword, com.iting.jobportal.auth.entity.Enum.Role role, com.iting.jobportal.auth.entity.Enum.AccountStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Account> accounts = accountRepository.findAll(pageable);
        return accounts.map(this::mapToUserListResponse);
    }

    @Override
    public UserListResponse getUserById(Long userId) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserListResponse(account);
    }

    @Override
    @Transactional
    public UserListResponse updateUser(Long adminId, Long userId, UpdateUserRequest request) {
        throw new UnsupportedOperationException("Admin user update is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public void banUser(Long adminId, Long userId, BanUserRequest request) {
        throw new UnsupportedOperationException("Admin ban user is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public void unbanUser(Long adminId, Long userId) {
        throw new UnsupportedOperationException("Admin unban user is not supported with current schema.sql mapping");
    }

    @Override
    @Transactional
    public void deleteUser(Long adminId, Long userId) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String email = account.getEmail();
        accountRepository.delete(account);
        
        logActivity(adminId, "DELETE_USER", "USER", userId, "Deleted user: " + email);
    }

    // ========== KIỂM DUYỆT TIN TUYỂN DỤNG ==========

    @Override
    public Page<?> getPendingJobs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastUpdate").descending());
        return jobRepository.findByStatus(JobStatus.PENDING, pageable);
    }

    @Override
    @Transactional
    public void approveJob(Long adminId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setStatus(JobStatus.ACTIVE);
        jobRepository.save(job);
        
        logActivity(adminId, "APPROVE_JOB", "JOB", jobId, "Approved job: " + job.getPosition());
    }

    @Override
    @Transactional
    public void rejectJob(Long adminId, Long jobId, String reason) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setStatus(JobStatus.CLOSED);
        jobRepository.save(job);
        
        logActivity(adminId, "REJECT_JOB", "JOB", jobId, "Rejected job: " + job.getPosition() + ". Reason: " + reason);
    }

    // ========== QUẢN LÝ BÁO CÁO ==========

    @Override
    public Page<UserReport> getReports(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null) {
            return reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        return reportRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public UserReport handleReport(Long adminId, Long reportId, String status, String note) {
        UserReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(status);
        report.setAdminNote(note);
        report.setHandledBy(adminId);
        report.setHandledAt(LocalDateTime.now());
        
        return reportRepository.save(report);
    }

    // ========== QUẢN LÝ DANH MỤC ==========

    @Override
    public List<Category> getCategoriesByType(String type) {
        return categoryRepository.findByTypeOrderBySortOrderAsc(type);
    }

    @Override
    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.existsByTypeAndName(category.getType(), category.getName())) {
            throw new RuntimeException("Category already exists");
        }
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category updateCategory(Long id, Category category) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (category.getName() != null) existing.setName(category.getName());
        if (category.getNameEn() != null) existing.setNameEn(category.getNameEn());
        if (category.getDescription() != null) existing.setDescription(category.getDescription());
        if (category.getIcon() != null) existing.setIcon(category.getIcon());
        if (category.getSortOrder() != null) existing.setSortOrder(category.getSortOrder());
        if (category.getActive() != null) existing.setActive(category.getActive());
        
        return categoryRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // ========== QUẢN LÝ NỘI DUNG TĨNH ==========

    @Override
    public Page<StaticContent> getStaticContents(String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending());
        if (type != null) {
            return staticContentRepository.findByType(type, pageable);
        }
        return staticContentRepository.findAll(pageable);
    }

    @Override
    public StaticContent getStaticContentBySlug(String slug) {
        return staticContentRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Content not found"));
    }

    @Override
    @Transactional
    public StaticContent createStaticContent(StaticContent content) {
        if (staticContentRepository.existsBySlug(content.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }
        return staticContentRepository.save(content);
    }

    @Override
    @Transactional
    public StaticContent updateStaticContent(Long id, StaticContent content) {
        StaticContent existing = staticContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        
        if (content.getTitle() != null) existing.setTitle(content.getTitle());
        if (content.getContent() != null) existing.setContent(content.getContent());
        if (content.getMetaDescription() != null) existing.setMetaDescription(content.getMetaDescription());
        if (content.getMetaKeywords() != null) existing.setMetaKeywords(content.getMetaKeywords());
        if (content.getThumbnailUrl() != null) existing.setThumbnailUrl(content.getThumbnailUrl());
        if (content.getSortOrder() != null) existing.setSortOrder(content.getSortOrder());
        
        return staticContentRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteStaticContent(Long id) {
        staticContentRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void publishStaticContent(Long id) {
        StaticContent content = staticContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        content.setPublished(true);
        content.setPublishedAt(LocalDateTime.now());
        staticContentRepository.save(content);
    }

    @Override
    @Transactional
    public void unpublishStaticContent(Long id) {
        StaticContent content = staticContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        content.setPublished(false);
        staticContentRepository.save(content);
    }

    // ========== BÁO CÁO THỐNG KÊ ==========

    @Override
    public DashboardStats getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);
        
        return DashboardStats.builder()
                // Tổng quan
                .totalUsers(accountRepository.count())
                .totalCandidates(0)
                .totalEmployers(0)
                .totalJobs(jobRepository.count())
                .totalApplications(applyFormRepository.count())
                
                // Trạng thái
                .activeUsers(0)
                .bannedUsers(0)
                .activeJobs(countJobsByStatus(JobStatus.ACTIVE))
                .pendingJobs(countJobsByStatus(JobStatus.PENDING))
                .expiredJobs(countJobsByStatus(JobStatus.EXPIRED))
                
                // Thống kê theo thời gian
                .newUsersToday(0)
                .newUsersThisWeek(0)
                .newUsersThisMonth(0)
                .newJobsToday(0)
                .newJobsThisWeek(0)
                .newJobsThisMonth(0)
                .applicationsToday(0)
                .applicationsThisWeek(0)
                .applicationsThisMonth(0)
                
                // Top thống kê
                .topCompanies(getTopCompanies())
                .topSkills(getTopSkills())
                .topLocations(getTopLocations())
                .recentActivities(getRecentActivities())
                .build();
    }

    // ========== ACTIVITY LOG ==========

    @Override
    @Transactional
    public void logActivity(Long userId, String action, String entityType, Long entityId, String description) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .build();
        activityLogRepository.save(log);
    }

    @Override
    public Page<ActivityLog> getActivityLogs(Long userId, String action, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (userId != null) {
            return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        if (action != null) {
            return activityLogRepository.findByActionOrderByCreatedAtDesc(action, pageable);
        }
        return activityLogRepository.findAll(pageable);
    }

    // ========== HELPER METHODS ==========

    private UserListResponse mapToUserListResponse(Account account) {
        UserListResponse.UserListResponseBuilder builder = UserListResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .role(null)
                .status(null)
                .createdAt(null)
                .lastLoginAt(null);
        
        return builder.build();
    }
    
    private long countJobsByStatus(JobStatus status) {
        return jobRepository.findByStatus(status, Pageable.unpaged()).getTotalElements();
    }
    
    private long countJobsCreatedAfter(LocalDateTime since) {
        return 0;
    }
    
    private long countApplicationsAfter(LocalDateTime since) {
        return 0;
    }
    
    private List<Map<String, Object>> getTopCompanies() {
        // Simplified implementation
        List<Map<String, Object>> result = new ArrayList<>();
        companyRepository.findAll().stream().limit(5).forEach(company -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", company.getId());
            map.put("name", company.getName());
            map.put("jobCount", 0);
            result.add(map);
        });
        return result;
    }
    
    private List<Map<String, Object>> getTopSkills() {
        // Simplified - should aggregate from job.techRequired
        return new ArrayList<>();
    }
    
    private List<Map<String, Object>> getTopLocations() {
        // Simplified - should aggregate from job.location
        return new ArrayList<>();
    }
    
    private List<Map<String, Object>> getRecentActivities() {
        List<Map<String, Object>> result = new ArrayList<>();
        activityLogRepository.findRecentActivities(
                LocalDateTime.now().minusDays(1),
                PageRequest.of(0, 10)
        ).forEach(log -> {
            Map<String, Object> map = new HashMap<>();
            map.put("action", log.getAction());
            map.put("description", log.getDescription());
            map.put("createdAt", log.getCreatedAt());
            result.add(map);
        });
        return result;
    }
}


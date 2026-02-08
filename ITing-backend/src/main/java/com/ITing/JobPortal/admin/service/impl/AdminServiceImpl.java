package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.entity.*;
import com.iting.jobportal.admin.repository.*;
import com.iting.jobportal.admin.service.AdminService;
import com.iting.jobportal.application.repository.JobApplicationRepository;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.core.domain.auth.Role;
import com.iting.jobportal.core.repository.auth.RoleRepository;
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
    private final JobApplicationRepository applicationRepository;
    private final CategoryRepository categoryRepository;
    private final StaticContentRepository staticContentRepository;
    private final UserReportRepository reportRepository;
    private final ActivityLogRepository activityLogRepository;
    private final RoleRepository roleRepository;

    // ========== QUẢN LÝ NGƯỜI DÙNG ==========

    @Override
    public Page<UserListResponse> getAllUsers(String keyword, com.iting.jobportal.auth.entity.Enum.Role role, AccountStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Sử dụng query đơn giản trước, có thể cải thiện bằng Specification pattern
        Page<Account> accounts;
        if (role != null && status != null) {
            // Find RBAC role by enum name
            Role rbacRole = roleRepository.findByName(role.name()).orElse(null);
            if (rbacRole != null) {
                accounts = accountRepository.findByRolesContainingAndStatus(rbacRole, status, pageable);
            } else {
                accounts = Page.empty(pageable);
            }
        } else if (role != null) {
            // Find RBAC role by enum name
            Role rbacRole = roleRepository.findByName(role.name()).orElse(null);
            if (rbacRole != null) {
                accounts = accountRepository.findByRolesContaining(rbacRole, pageable);
            } else {
                accounts = Page.empty(pageable);
            }
        } else if (status != null) {
            accounts = accountRepository.findByStatus(status, pageable);
        } else {
            accounts = accountRepository.findAll(pageable);
        }
        
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
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getRole() != null) {
            // Find RBAC role by name
            Role rbacRole = roleRepository.findByName(request.getRole().name())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole().name()));
            account.setRoles(Set.of(rbacRole));
        }
        if (request.getStatus() != null) {
            account.setStatus(request.getStatus());
        }
        
        Account saved = accountRepository.save(account);
        
        // Log activity
        logActivity(adminId, "UPDATE_USER", "USER", userId, 
                "Updated user: " + account.getEmail() + (request.getNote() != null ? ". Note: " + request.getNote() : ""));
        
        return mapToUserListResponse(saved);
    }

    @Override
    @Transactional
    public void banUser(Long adminId, Long userId, BanUserRequest request) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        account.setStatus(AccountStatus.BANNED);
        accountRepository.save(account);
        
        logActivity(adminId, "BAN_USER", "USER", userId, 
                "Banned user: " + account.getEmail() + ". Reason: " + request.getReason());
    }

    @Override
    @Transactional
    public void unbanUser(Long adminId, Long userId) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);
        
        logActivity(adminId, "UNBAN_USER", "USER", userId, "Unbanned user: " + account.getEmail());
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
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
                .totalCandidates(
                        accountRepository.countByRoles_Name(
                                com.iting.jobportal.auth.entity.Enum.Role.CANDIDATE.name()
                        )
                )
                .totalEmployers(
                        accountRepository.countByRoles_Name(
                                com.iting.jobportal.auth.entity.Enum.Role.EMPLOYER.name()
                        )
                )
                .totalJobs(jobRepository.count())
                .totalApplications(applicationRepository.count())
                
                // Trạng thái
                .activeUsers(accountRepository.countByStatus(AccountStatus.ACTIVE))
                .bannedUsers(accountRepository.countByStatus(AccountStatus.BANNED))
                .activeJobs(jobRepository.countByEmployerIdAndStatus(null, JobStatus.ACTIVE))
                .pendingJobs(countJobsByStatus(JobStatus.PENDING))
                .expiredJobs(countJobsByStatus(JobStatus.EXPIRED))
                
                // Thống kê theo thời gian
                .newUsersToday(accountRepository.countByCreatedAtAfter(startOfDay))
                .newUsersThisWeek(accountRepository.countByCreatedAtAfter(startOfWeek))
                .newUsersThisMonth(accountRepository.countByCreatedAtAfter(startOfMonth))
                .newJobsToday(countJobsCreatedAfter(startOfDay))
                .newJobsThisWeek(countJobsCreatedAfter(startOfWeek))
                .newJobsThisMonth(countJobsCreatedAfter(startOfMonth))
                .applicationsToday(countApplicationsAfter(startOfDay))
                .applicationsThisWeek(countApplicationsAfter(startOfWeek))
                .applicationsThisMonth(countApplicationsAfter(startOfMonth))
                
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
        // Get primary role from RBAC roles for backward compatibility
        com.iting.jobportal.auth.entity.Enum.Role primaryRole = account.getRoles().stream()
                .map(role -> com.iting.jobportal.auth.entity.Enum.Role.valueOf(role.getName()))
                .findFirst()
                .orElse(com.iting.jobportal.auth.entity.Enum.Role.CANDIDATE);
        
        UserListResponse.UserListResponseBuilder builder = UserListResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .role(primaryRole)
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .lastLoginAt(account.getLastLoginAt());
        
        if (primaryRole == com.iting.jobportal.auth.entity.Enum.Role.CANDIDATE) {
            userRepository.findById(account.getId()).ifPresent(user -> {
                builder.fullName(user.getFirstName() + " " + user.getLastName());
                builder.avatarUrl(user.getAvatarUrl());
            });
        } else if (primaryRole == com.iting.jobportal.auth.entity.Enum.Role.EMPLOYER) {
            companyRepository.findById(account.getId()).ifPresent(company -> {
                builder.companyName(company.getName());
                builder.avatarUrl(company.getLogoUrl());
            });
        }
        
        return builder.build();
    }
    
    private long countJobsByStatus(JobStatus status) {
        return jobRepository.findByStatus(status, Pageable.unpaged()).getTotalElements();
    }
    
    private long countJobsCreatedAfter(LocalDateTime since) {
        // Simplified - should use proper query
        return jobRepository.findAll().stream()
                .filter(j -> j.getCreatedAt() != null && j.getCreatedAt().isAfter(since))
                .count();
    }
    
    private long countApplicationsAfter(LocalDateTime since) {
        // Simplified - should use proper query
        return applicationRepository.count(); // Placeholder
    }
    
    private List<Map<String, Object>> getTopCompanies() {
        // Simplified implementation
        List<Map<String, Object>> result = new ArrayList<>();
        companyRepository.findAll().stream().limit(5).forEach(company -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", company.getId());
            map.put("name", company.getName());
            map.put("jobCount", jobRepository.countByEmployerId(company.getId()));
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


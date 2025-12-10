package com.iting.jobportal.admin.service;

import com.iting.jobportal.admin.dto.*;
import com.iting.jobportal.admin.entity.*;
import com.iting.jobportal.auth.entity.Enum.AccountStatus;
import com.iting.jobportal.auth.entity.Enum.Role;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AdminService {

    // ========== QUẢN LÝ NGƯỜI DÙNG ==========
    
    Page<UserListResponse> getAllUsers(String keyword, Role role, AccountStatus status, int page, int size);
    
    UserListResponse getUserById(Long userId);
    
    UserListResponse updateUser(Long adminId, Long userId, UpdateUserRequest request);
    
    void banUser(Long adminId, Long userId, BanUserRequest request);
    
    void unbanUser(Long adminId, Long userId);
    
    void deleteUser(Long adminId, Long userId);
    
    // ========== KIỂM DUYỆT TIN TUYỂN DỤNG ==========
    
    Page<?> getPendingJobs(int page, int size);
    
    void approveJob(Long adminId, Long jobId);
    
    void rejectJob(Long adminId, Long jobId, String reason);
    
    // ========== QUẢN LÝ BÁO CÁO ==========
    
    Page<UserReport> getReports(String status, int page, int size);
    
    UserReport handleReport(Long adminId, Long reportId, String status, String note);
    
    // ========== QUẢN LÝ DANH MỤC ==========
    
    List<Category> getCategoriesByType(String type);
    
    Category createCategory(Category category);
    
    Category updateCategory(Long id, Category category);
    
    void deleteCategory(Long id);
    
    // ========== QUẢN LÝ NỘI DUNG TĨNH ==========
    
    Page<StaticContent> getStaticContents(String type, int page, int size);
    
    StaticContent getStaticContentBySlug(String slug);
    
    StaticContent createStaticContent(StaticContent content);
    
    StaticContent updateStaticContent(Long id, StaticContent content);
    
    void deleteStaticContent(Long id);
    
    void publishStaticContent(Long id);
    
    void unpublishStaticContent(Long id);
    
    // ========== BÁO CÁO THỐNG KÊ ==========
    
    DashboardStats getDashboardStats();
    
    // ========== ACTIVITY LOG ==========
    
    void logActivity(Long userId, String action, String entityType, Long entityId, String description);
    
    Page<ActivityLog> getActivityLogs(Long userId, String action, int page, int size);
}


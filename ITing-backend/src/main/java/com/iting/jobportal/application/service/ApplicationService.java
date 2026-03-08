package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ApplicationService {
    
    // ========== CHO ỨNG VIÊN ==========
    
    // Nộp đơn ứng tuyển
    ApplicationResponse applyJob(String userId, ApplyJobRequest request);
    
    // Rút đơn ứng tuyển
    void withdrawApplication(String userId, Long applicationId);
    
    // Xem danh sách đơn đã nộp
    Page<ApplicationResponse> getMyApplications(String userId, int page, int size);
    
    // Kiểm tra đã ứng tuyển job chưa
    boolean hasApplied(String userId, Long jobId);
    
    // ========== CHO NHÀ TUYỂN DỤNG ==========
    
    // Xem danh sách đơn ứng tuyển của một job
    Page<ApplicationResponse> getApplicationsByJob(Long employerId, Long jobId, int page, int size);
    
    // Xem tất cả đơn ứng tuyển (của tất cả jobs của employer)
    Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, int page, int size);
    
    // Tìm kiếm và lọc đơn ứng tuyển
    Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request);
    
    // Xem chi tiết đơn ứng tuyển (đánh dấu đã xem)
    ApplicationResponse viewApplication(Long employerId, Long applicationId);
    
    // Cập nhật trạng thái đơn ứng tuyển
    ApplicationResponse updateApplicationStatus(Long employerId, Long applicationId, UpdateApplicationStatusRequest request);
    
    // Chấp nhận ứng viên
    ApplicationResponse acceptApplication(Long employerId, Long applicationId, String note);
    
    // Từ chối ứng viên
    ApplicationResponse rejectApplication(Long employerId, Long applicationId, String note);
    
    // Đếm số đơn ứng tuyển theo trạng thái
    long countApplicationsByStatus(Long employerId, Long jobId, String status);
    
    // ========== THỐNG KÊ ==========
    
    // Thống kê cho employer
    ApplicationStats getStatsForEmployer(Long employerId);
    
    // Thống kê cho một job cụ thể
    ApplicationStats getStatsForJob(Long jobId);
}


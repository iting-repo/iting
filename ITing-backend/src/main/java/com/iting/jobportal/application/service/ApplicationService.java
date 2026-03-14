package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.*;
import org.springframework.data.domain.Page;

public interface ApplicationService {

    // ========== CHO ỨNG VIÊN (CANDIDATE) ==========

    /**
     * Nộp đơn ứng tuyển.
     * userId hiện tại là Long (Id kế thừa từ Account).
     */
    ApplicationResponse applyJob(Long userId, ApplyJobRequest request);

    /**
     * Rút đơn ứng tuyển.
     */
    void withdrawApplication(Long userId, Long applicationId);

    /**
     * Xem danh sách đơn đã nộp của cá nhân ứng viên.
     */
    Page<ApplicationResponse> getMyApplications(Long userId, int page, int size);

    /**
     * Kiểm tra ứng viên đã ứng tuyển job này chưa.
     */
    boolean hasApplied(Long userId, Long jobId);

    // ========== CHO NHÀ TUYỂN DỤNG (EMPLOYER) ==========

    /**
     * Xem danh sách đơn ứng tuyển của một job cụ thể.
     */
    Page<ApplicationResponse> getApplicationsByJob(Long employerId, Long jobId, int page, int size);

    /**
     * Xem tất cả đơn ứng tuyển thuộc quyền quản lý của employer.
     */
    Page<ApplicationResponse> getAllApplicationsForEmployer(Long employerId, int page, int size);

    /**
     * Tìm kiếm và lọc đơn ứng tuyển.
     */
    Page<ApplicationResponse> searchApplications(Long employerId, ApplicationSearchRequest request);

    /**
     * Xem chi tiết đơn ứng tuyển.
     */
    ApplicationResponse viewApplication(Long employerId, Long applicationId);

    /**
     * Cập nhật trạng thái đơn ứng tuyển (VD: Đang xem, Phỏng vấn, v.v.).
     */
    ApplicationResponse updateApplicationStatus(Long employerId, Long applicationId, UpdateApplicationStatusRequest request);

    /**
     * Chấp nhận ứng viên.
     */
    ApplicationResponse acceptApplication(Long employerId, Long applicationId, String note);

    /**
     * Từ chối ứng viên.
     */
    ApplicationResponse rejectApplication(Long employerId, Long applicationId, String note);

    /**
     * Đếm số đơn ứng tuyển theo trạng thái cụ thể.
     */
    long countApplicationsByStatus(Long employerId, Long jobId, String status);

    // ========== THỐNG KÊ (ANALYTICS) ==========

    /**
     * Thống kê tổng quan cho nhà tuyển dụng.
     */
    ApplicationStats getStatsForEmployer(Long employerId);

    /**
     * Thống kê chi tiết cho một tin tuyển dụng cụ thể.
     */
    ApplicationStats getStatsForJob(Long jobId);
}
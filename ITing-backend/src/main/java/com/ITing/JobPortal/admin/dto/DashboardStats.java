package com.iting.jobportal.admin.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStats {
    // Tổng quan
    private long totalUsers;
    private long totalCandidates;
    private long totalEmployers;
    private long totalJobs;
    private long totalApplications;
    
    // Trạng thái
    private long activeUsers;
    private long bannedUsers;
    private long activeJobs;
    private long pendingJobs;
    private long expiredJobs;
    
    // Thống kê theo thời gian
    private long newUsersToday;
    private long newUsersThisWeek;
    private long newUsersThisMonth;
    private long newJobsToday;
    private long newJobsThisWeek;
    private long newJobsThisMonth;
    private long applicationsToday;
    private long applicationsThisWeek;
    private long applicationsThisMonth;
    
    // Top thống kê
    private List<Map<String, Object>> topCompanies;      // Công ty nhiều job nhất
    private List<Map<String, Object>> topSkills;         // Kỹ năng được yêu cầu nhiều nhất
    private List<Map<String, Object>> topLocations;      // Địa điểm tuyển dụng nhiều nhất
    private List<Map<String, Object>> recentActivities;  // Hoạt động gần đây
}


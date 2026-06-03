package com.iting.jobportal.admin.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
  // Tổng quan
  private long totalUsers;
  private double userChange; // % thay đổi so với hôm qua

  private long totalJobs;
  private double jobChange; // % thay đổi so với hôm qua

  private long totalApplications;
  private double applicationChange; // % thay đổi so với hôm qua

  private long pendingApplications;
  private double pendingChange; // % thay đổi so với hôm qua

  // Thống kê biểu đồ (7 ngày gần nhất)
  private List<ChartRecord> chartData;

  // Hoạt động gần đây
  private List<RecentJobActivity> recentActivities;

  @Data
  @Builder
  public static class ChartRecord {
    private String day; // Mon, Tue, ...
    private long jobPosts;
    private long users;
  }

  @Data
  @Builder
  public static class RecentJobActivity {
    private String jobTitle;
    private String company;
    private String dateTime;
    private long applications;
    private String status;
  }
}

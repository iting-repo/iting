package com.iting.jobportal.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateDashboardStats {

    private String fullName;
    private String avatarUrl;
    private boolean profileCompleted;
    private int profileCompletionPercent;

    private long savedJobsCount;
    private long unreadNotificationCount;

    private long totalApplications;
    private List<RecentApplicationResponse> recentApplications;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentApplicationResponse {
        private Long id;
        private String companyName;
        private String companyLogo;
        private String jobPosition;
        private String appliedAt;
        private String status;
    }
}

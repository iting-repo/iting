package com.iting.jobportal.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DetailedStatsDto {
    private long totalVisits; // Fallback to totalUsers
    private double visitsChange;
    
    private long openJobs;
    private double jobsChange;
    
    private long newCompanies;
    private double companiesChange;
    
    private double responseRate;
    private double responseRateChange;

    private GrowthData growthData;
    private Map<String, Long> topSkills;
    private Map<String, Long> userRoles;
    private Map<String, Long> topLocations;
    private Map<String, Long> trendingDomains;

    @Data
    @Builder
    public static class GrowthData {
        private List<String> labels;
        private List<Long> newUsers;
        private List<Long> applications;
    }
}

package com.iting.jobportal.admin.service.impl;

import com.iting.jobportal.admin.dto.DetailedStatsDto;
import com.iting.jobportal.admin.service.AdminStatsService;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.application.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;

@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private final AccountRepository accountRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Override
    public DetailedStatsDto getDetailedStats(String dateRange) {
        long totalUsers = accountRepository.count();
        long totalJobs = jobRepository.count();
        long totalCompanies = companyRepository.count();
        long totalApplications = jobApplicationRepository.count();

        // Calculate Response Rate
        long respondedApplications = totalApplications - jobApplicationRepository.countByStatus(com.iting.jobportal.application.entity.enums.ApplicationStatus.PENDING);
        double responseRate = totalApplications > 0 ? ((double) respondedApplications / totalApplications) * 100 : 0.0;

        Map<String, Long> userRoles = new HashMap<>();
        userRoles.put("Ứng viên", accountRepository.countByRole(com.iting.jobportal.auth.entity.Enum.Role.CANDIDATE));
        userRoles.put("Nhà tuyển dụng", accountRepository.countByRole(com.iting.jobportal.auth.entity.Enum.Role.EMPLOYER));
        userRoles.put("Quản trị viên", accountRepository.countByRole(com.iting.jobportal.auth.entity.Enum.Role.ADMIN));

        // Growth Data (last 7 days)
        List<String> labels = new ArrayList<>();
        List<Long> newUsers = new ArrayList<>();
        List<Long> newApps = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            labels.add(d.format(formatter));
            
            LocalDateTime startOfDay = d.atStartOfDay();
            LocalDateTime endOfDay = d.plusDays(1).atStartOfDay();
            
            long countUsers = accountRepository.countByCreatedAtBetween(startOfDay, endOfDay);
            long countApps = jobApplicationRepository.countByTimeSentBetween(startOfDay, endOfDay);
            
            newUsers.add(countUsers);
            newApps.add(countApps);
        }

        DetailedStatsDto.GrowthData growthData = DetailedStatsDto.GrowthData.builder()
                .labels(labels)
                .newUsers(newUsers)
                .applications(newApps)
                .build();

        // Top Skills
        List<Job> allJobs = jobRepository.findAll(); // Assuming fetching all is OK for prototype. Better to fetch active jobs
        Map<String, Long> skillCountMap = new HashMap<>();
        for (Job job : allJobs) {
            if (job.getSkills() != null && !job.getSkills().isEmpty()) {
                for (String skill : job.getSkills()) {
                    String trimmedSkill = skill.trim();
                    if (!trimmedSkill.isEmpty()) {
                        skillCountMap.put(trimmedSkill, skillCountMap.getOrDefault(trimmedSkill, 0L) + 1);
                    }
                }
            }
        }
        
        Map<String, Long> topSkills = skillCountMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));

        if (topSkills.isEmpty()) {
            topSkills.put("ReactJS", 0L);
            topSkills.put("Java", 0L);
            topSkills.put("NodeJS", 0L);
        }

        // Mocking remaining data for now
        Map<String, Long> topLocations = new HashMap<>();
        topLocations.put("Hồ Chí Minh", 1850L);
        topLocations.put("Hà Nội", 1420L);
        topLocations.put("Đà Nẵng", 560L);
        topLocations.put("Cần Thơ", 210L);
        topLocations.put("Bình Dương", 380L);

        Map<String, Long> trendingDomains = new HashMap<>();
        trendingDomains.put("Web Dev", 95L);
        trendingDomains.put("Mobile", 80L);
        trendingDomains.put("Data Sci", 85L);
        trendingDomains.put("DevOps", 75L);
        trendingDomains.put("AI/ML", 90L);
        trendingDomains.put("Security", 70L);

        return DetailedStatsDto.builder()
                .totalVisits(totalUsers) // Using users as a proxy for visits
                .visitsChange(12.5)
                .openJobs(totalJobs)
                .jobsChange(5.2)
                .newCompanies(totalCompanies)
                .companiesChange(-2.1)
                .responseRate(Math.round(responseRate * 10.0) / 10.0)
                .responseRateChange(4.3)
                .growthData(growthData)
                .topSkills(topSkills)
                .userRoles(userRoles)
                .topLocations(topLocations)
                .trendingDomains(trendingDomains)
                .build();
    }
}

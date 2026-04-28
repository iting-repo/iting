package com.iting.jobportal.recommendation.service.impl;

import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import com.iting.jobportal.recommendation.service.InteractionService;
import com.iting.jobportal.recommendation.service.RecommendationService;
import com.iting.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    private final JobRepository jobRepository;
    private final InteractionService interactionService;
    private final UserRepository userRepository;
    private final UserSearchHistoryRepository searchHistoryRepository;
    private final UserJobInteractionRepository interactionRepository;

    @Override
    public List<JobResponse> recommendHomepage(Long userId, int limit) {
        if (userId == null) {
            return getTrendingJobs(limit);
        }

        boolean enoughBehavior = interactionService.hasEnoughBehavior(userId);
        var userOpt = userRepository.findById(userId);
        boolean hasCv = userOpt.isPresent();

        if (enoughBehavior) {
            log.info("Generating Collaborative Hybrid Recommendation (Phase 3) for user {}", userId);
            return recommendHybrid(userId, limit);
        } else if (hasCv) {
            log.info("Generating CV-Content Recommendation (Phase 2+) for user {}", userId);
            return recommendByCv(userId, limit);
        } else {
            log.info("Falling back to Trending Recommendation for user {}", userId);
            return getTrendingJobs(limit);
        }
    }

    @Override
    public List<JobResponse> getTrendingJobs(int limit) {
        List<Job> candidates = jobRepository.findTop50ByStatusOrderByViewCountDesc(JobStatus.ACTIVE);
        Collections.shuffle(candidates);
        return candidates.stream()
                .limit(limit)
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private List<JobResponse> recommendByCv(Long userId, int limit) {
        List<Job> candidates = jobRepository.findTop50ByStatusOrderByCreatedAtDesc(JobStatus.ACTIVE);
        List<UserSearchHistory> searchHistories = searchHistoryRepository.findByAccountIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5));
        
        // Phase 3: Bonus from history behavior
        return candidates.stream()
                .map(job -> {
                    double score = calculateScore(job, searchHistories);
                    return new ScoredJob(job, score);
                })
                .sorted(Comparator.comparingDouble(ScoredJob::getScore).reversed())
                .limit(limit)
                .map(sj -> JobResponse.fromEntity(sj.getJob()))
                .collect(Collectors.toList());
    }

    private List<JobResponse> recommendHybrid(Long userId, int limit) {
        // 1. Lấy đề xuất từ Collaborative Filtering (Dựa trên người dùng tương đồng)
        List<Long> collaborativeIds = interactionRepository.findSuggestedJobsByUserInterest(userId, PageRequest.of(0, limit));
        List<Job> collaborativeJobs = jobRepository.findAllById(collaborativeIds);
        
        // 2. Lấy đề xuất từ Content (Search history)
        List<JobResponse> contentBased = recommendByCv(userId, limit);
        
        // 3. Lấy đề xuất Trending (Dành cho sự mới mẻ/phổ quát)
        List<JobResponse> trending = getTrendingJobs(limit / 2);

        Set<Long> seenIds = new HashSet<>();
        List<JobResponse> finalResults = new ArrayList<>();

        // Ưu tiên 1: Collaborative (Hàn gắn sở thích chung) - Max 40%
        int colLimit = (int) (limit * 0.4);
        for (Job job : collaborativeJobs) {
            if (finalResults.size() >= colLimit) break;
            if (job.getStatus() == JobStatus.ACTIVE && job.getCompany() != null) {
                JobResponse resp = JobResponse.fromEntity(job);
                if (resp.getCompanyName() != null) {
                    finalResults.add(resp);
                    seenIds.add(job.getId());
                }
            }
        }

        // Ưu tiên 2: Content (Sở thích cá nhân) - Max đến khi gần đủ limit
        for (JobResponse resp : contentBased) {
            if (finalResults.size() >= (limit - 2)) break; // Chừa chỗ cho trending
            if (!seenIds.contains(resp.getId()) && resp.getCompanyName() != null) {
                finalResults.add(resp);
                seenIds.add(resp.getId());
            }
        }

        // Ưu tiên 3: Trending (Lắp đầy chỗ trống)
        for (JobResponse resp : trending) {
            if (finalResults.size() >= limit) break;
            if (!seenIds.contains(resp.getId()) && resp.getCompanyName() != null) {
                finalResults.add(resp);
                seenIds.add(resp.getId());
            }
        }

        return finalResults;
    }

    private double calculateScore(Job job, List<UserSearchHistory> searchHistories) {
        double score = 0.0;
        if (searchHistories.isEmpty()) return 0.0;

        for (UserSearchHistory history : searchHistories) {
            if (history.getKeyword() != null) {
                String keyword = history.getKeyword().toLowerCase();
                if (job.getTitle().toLowerCase().contains(keyword)) score += 20.0;
                
                // Fix tech match
                if (job.getSkills() != null && job.getSkills().stream()
                        .anyMatch(tech -> tech.toLowerCase().contains(keyword))) {
                    score += 15.0;
                }
            }
            
            if (history.getLocation() != null && job.getProvince() != null) {
                if (job.getProvince().equalsIgnoreCase(history.getLocation())) score += 10.0;
            }
        }
        
        // Bonus cho job có "featured" (tin nổi bật trả phí)
        if (Boolean.TRUE.equals(job.getFeatured())) score += 5.0;
        
        return score;
    }

    @lombok.Value
    private static class ScoredJob {
        Job job;
        double score;
    }
}

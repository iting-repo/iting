package com.iting.jobportal.recommendation.service.impl;

import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.recommendation.entity.UserJobInteraction;
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

        // ===== MỚI: Xây dựng behavioral profile từ hành vi cá nhân =====
        BehavioralProfile profile = buildBehavioralProfile(userId);

        return candidates.stream()
                .map(job -> {
                    double score = calculateScore(job, searchHistories, profile);
                    return new ScoredJob(job, score);
                })
                .sorted(Comparator.comparingDouble(ScoredJob::getScore).reversed())
                .limit(limit)
                .map(sj -> JobResponse.fromEntity(sj.getJob()))
                .collect(Collectors.toList());
    }

    private List<JobResponse> recommendHybrid(Long userId, int limit) {
        // 1. Lấy đề xuất từ Collaborative Filtering (Dựa trên người dùng tương đồng)
        //    Đã cải tiến: xếp hạng theo SUM(weight) thay vì COUNT(id)
        List<Long> collaborativeIds = interactionRepository.findSuggestedJobsByUserInterest(userId, PageRequest.of(0, limit));
        List<Job> collaborativeJobs = jobRepository.findAllById(collaborativeIds);
        
        // 2. Lấy đề xuất từ Content (Search history + Behavioral profile)
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

    // =========================================================
    // BEHAVIORAL PROFILE — Suy ra sở thích từ hành vi cá nhân
    // =========================================================

    /**
     * Xây dựng "hồ sơ sở thích ẩn" từ các job mà user đã tương tác.
     * 
     * Cách hoạt động:
     * - Lấy 20 interaction gần nhất (ưu tiên weight cao: APPLY > SAVE > CLICK > VIEW)
     * - Trích xuất skills và locations từ các job đó
     * - Tính trọng số: skill từ job đã APPLY (weight=5) mạnh hơn skill từ job đã VIEW (weight=1)
     * 
     * Ví dụ:
     *   User APPLY 2 job React, VIEW 1 job Java
     *   → skillPreference: {"react": 10, "javascript": 10, "java": 1}
     *   → User rõ ràng thích React hơn Java
     */
    private BehavioralProfile buildBehavioralProfile(Long userId) {
        Map<String, Double> skillPreference = new HashMap<>();
        Map<String, Double> locationPreference = new HashMap<>();

        try {
            List<UserJobInteraction> interactions = interactionRepository
                    .findRecentInteractionsWithJobs(userId, PageRequest.of(0, 20));

            for (UserJobInteraction interaction : interactions) {
                Job job = interaction.getJob();
                double weight = interaction.getWeight();

                // Trích xuất skill preference từ các job đã tương tác
                if (job.getSkills() != null) {
                    for (String skill : job.getSkills()) {
                        String normalizedSkill = skill.toLowerCase().trim();
                        skillPreference.merge(normalizedSkill, weight, Double::sum);
                    }
                }

                // Trích xuất title keywords
                if (job.getTitle() != null) {
                    for (String token : job.getTitle().toLowerCase().split("\\s+")) {
                        if (token.length() >= 3) { // Bỏ qua từ quá ngắn
                            skillPreference.merge(token, weight * 0.5, Double::sum);
                        }
                    }
                }

                // Trích xuất location preference
                if (job.getProvince() != null) {
                    locationPreference.merge(
                            job.getProvince().toLowerCase().trim(), weight, Double::sum);
                }
            }

            if (!skillPreference.isEmpty()) {
                log.info("📊 Behavioral profile for user {}: top skills={}, top locations={}",
                        userId,
                        getTopN(skillPreference, 5),
                        getTopN(locationPreference, 3));
            }
        } catch (Exception e) {
            log.warn("Failed to build behavioral profile: {}", e.getMessage());
        }

        return new BehavioralProfile(skillPreference, locationPreference);
    }

    // =========================================================
    // SCORING — Kết hợp Search History + Behavioral Profile
    // =========================================================

    /**
     * Tính điểm phù hợp cho 1 job dựa trên 2 nguồn tín hiệu:
     * 
     * 1. Search History (explicit signal):  Keyword + Location user đã search
     * 2. Behavioral Profile (implicit signal): Skills + Locations từ job user đã VIEW/SAVE/APPLY
     * 
     * Công thức:
     *   totalScore = searchScore + behaviorScore + featuredBonus
     * 
     * Trong đó:
     *   searchScore   = match title (+20) + match skills (+15) + match location (+10)
     *   behaviorScore = Σ skillWeight (max +25) + locationWeight (max +15)
     *   featuredBonus = +5 nếu job nổi bật
     */
    private double calculateScore(Job job, List<UserSearchHistory> searchHistories,
                                  BehavioralProfile profile) {
        double score = 0.0;

        // ===== PHẦN 1: Search History Score (giữ nguyên logic cũ) =====
        if (!searchHistories.isEmpty()) {
            for (UserSearchHistory history : searchHistories) {
                if (history.getKeyword() != null) {
                    String keyword = history.getKeyword().toLowerCase();
                    if (job.getTitle() != null && job.getTitle().toLowerCase().contains(keyword)) {
                        score += 20.0;
                    }

                    if (job.getSkills() != null && job.getSkills().stream()
                            .anyMatch(tech -> tech.toLowerCase().contains(keyword))) {
                        score += 15.0;
                    }
                }

                if (history.getLocation() != null && job.getProvince() != null) {
                    if (job.getProvince().equalsIgnoreCase(history.getLocation())) {
                        score += 10.0;
                    }
                }
            }
        }

        // ===== PHẦN 2 (MỚI): Behavioral Profile Score =====
        if (profile != null) {
            // 2a. Skill preference bonus
            //     Nếu job yêu cầu skill mà user đã APPLY/SAVE → bonus cao
            double skillBonus = 0.0;
            if (job.getSkills() != null && !profile.skillPreference.isEmpty()) {
                for (String skill : job.getSkills()) {
                    String normalized = skill.toLowerCase().trim();
                    Double prefWeight = profile.skillPreference.get(normalized);
                    if (prefWeight != null) {
                        // Scale: prefWeight thường từ 1 (1 VIEW) đến 25 (5 APPLY cùng skill)
                        // Normalize về max +5 per skill match
                        skillBonus += Math.min(prefWeight, 5.0);
                    }
                }
                // Cap tổng skill bonus ở 25 điểm để không overwhelm search score
                skillBonus = Math.min(skillBonus, 25.0);
            }
            score += skillBonus;

            // 2b. Location preference bonus
            //     Nếu job ở địa điểm mà user thường xem → bonus
            if (job.getProvince() != null && !profile.locationPreference.isEmpty()) {
                Double locWeight = profile.locationPreference.get(
                        job.getProvince().toLowerCase().trim());
                if (locWeight != null) {
                    // Scale: locWeight thường từ 1 đến 25
                    // Normalize về max +15
                    score += Math.min(locWeight * 3.0, 15.0);
                }
            }
        }

        // ===== PHẦN 3: Featured bonus (giữ nguyên) =====
        if (Boolean.TRUE.equals(job.getFeatured())) score += 5.0;

        return score;
    }

    // =========================================================
    // HELPER CLASSES
    // =========================================================

    /**
     * Hồ sơ sở thích ẩn — xây dựng từ hành vi cá nhân (VIEW/CLICK/SAVE/APPLY).
     * Mỗi entry trong map: key = tên skill/location, value = tổng trọng số hành vi.
     * 
     * Ví dụ: user APPLY 2 job React (weight=5 each) + VIEW 1 job React (weight=1)
     * → skillPreference.get("react") = 11
     */
    private record BehavioralProfile(
            Map<String, Double> skillPreference,
            Map<String, Double> locationPreference
    ) {}

    @lombok.Value
    private static class ScoredJob {
        Job job;
        double score;
    }

    /**
     * Lấy top N entries có value cao nhất từ map (dùng cho logging).
     */
    private Map<String, Double> getTopN(Map<String, Double> map, int n) {
        return map.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(n)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new));
    }
}


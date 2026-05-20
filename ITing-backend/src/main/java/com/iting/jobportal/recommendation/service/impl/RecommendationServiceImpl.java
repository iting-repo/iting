package com.iting.jobportal.recommendation.service.impl;

import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.recommendation.entity.UserJobInteraction;
import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import com.iting.jobportal.recommendation.service.InteractionService;
import com.iting.jobportal.recommendation.service.RecommendationService;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.repository.CVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Recommendation engine — đa yếu tố, có chuẩn hoá điểm.
 *
 * <h2>Tổng quan</h2>
 * <ul>
 *   <li><b>Cold-start (chưa login):</b> Trending (popularity).</li>
 *   <li><b>Có CV nhưng ít hành vi:</b> Content-based scoring (search history + behavior + CV embedding).</li>
 *   <li><b>Đủ hành vi:</b> Hybrid (Collaborative + Content + Trending) với trọng số thích nghi.</li>
 * </ul>
 *
 * <h2>Các yếu tố scoring</h2>
 * Mỗi sub-score được normalize về [0, 1] rồi nhân với weight cố định để tránh
 * 1 yếu tố lấn át toàn bộ:
 * <pre>
 *   30  Semantic (cosine CV ↔ job)
 *   20  Search history (keyword + location)
 *   15  Skill preference (behavioral, có time-decay)
 *   10  Location preference (behavioral)
 *    5  Job type preference
 *    5  Experience level preference
 *    5  Salary fit (so với salary user hay search)
 *    5  Freshness (job mới đăng < 30 ngày)
 *    3  Featured flag
 * </pre>
 * Tổng tối đa ≈ 98 (chưa kể trừ điểm khi cùng công ty xuất hiện nhiều lần).
 *
 * <h2>Loại trừ</h2>
 * <ul>
 *   <li>Job đã hết hạn (dueDate &lt; today).</li>
 *   <li>Job user đã ứng tuyển (InteractionType.APPLY).</li>
 *   <li>Job thuộc công ty bị disable.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    // ─── Trọng số các yếu tố ─────────────────────────────────────────
    private static final double W_SEMANTIC = 30.0;
    private static final double W_SEARCH   = 20.0;
    private static final double W_SKILL    = 15.0;
    private static final double W_LOCATION = 10.0;
    private static final double W_JOBTYPE  = 5.0;
    private static final double W_EXP      = 5.0;
    private static final double W_SALARY   = 5.0;
    private static final double W_FRESH    = 5.0;
    private static final double W_FEATURED = 3.0;

    // Diversity: nếu cùng 1 công ty đã xuất hiện ≥ MAX_PER_COMPANY job trong kết quả,
    // các job tiếp theo của công ty đó bị nhân hệ số giảm.
    private static final int MAX_PER_COMPANY = 2;
    private static final double DIVERSITY_PENALTY = 0.6;

    // Pool ứng viên — đủ rộng để bao quát job cũ phù hợp hồ sơ user
    private static final int CANDIDATE_POOL_SIZE = 200;

    // Half-life: behavior cũ giảm trọng số theo thời gian
    private static final double BEHAVIOR_HALFLIFE_DAYS = 30.0;

    private final JobRepository jobRepository;
    private final InteractionService interactionService;
    private final UserRepository userRepository;
    private final CVRepository cvRepository;
    private final UserSearchHistoryRepository searchHistoryRepository;
    private final UserJobInteractionRepository interactionRepository;
    private final JobEmbeddingService jobEmbeddingService;

    @Override
    public List<JobResponse> recommendHomepage(Long userId, int limit) {
        if (userId == null) {
            return getTrendingJobs(limit);
        }

        boolean enoughBehavior = interactionService.hasEnoughBehavior(userId);
        var userOpt = userRepository.findById(userId);
        boolean hasCv = userOpt.isPresent();

        if (enoughBehavior) {
            log.info("Generating Hybrid Recommendation for user {}", userId);
            return recommendHybrid(userId, limit);
        } else if (hasCv) {
            log.info("Generating Content-based Recommendation for user {}", userId);
            return recommendByContent(userId, limit);
        } else {
            log.info("Falling back to Trending for user {}", userId);
            return getTrendingJobs(limit);
        }
    }

    @Override
    public List<JobResponse> getTrendingJobs(int limit) {
        // Mix popularity (viewCount) với randomness nhẹ, nhưng vẫn deterministic-ish
        List<Job> candidates = jobRepository.findTop50ByStatusOrderByViewCountDesc(JobStatus.ACTIVE);
        Collections.shuffle(candidates);
        return candidates.stream()
                .filter(j -> j.getCompany() != null && Boolean.TRUE.equals(j.getCompany().getActive()))
                .filter(this::isNotExpired)
                .limit(limit)
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // =================================================================
    // CONTENT-BASED
    // =================================================================

    private List<JobResponse> recommendByContent(Long userId, int limit) {
        List<Job> pool = candidatePool(userId);
        if (pool.isEmpty()) return getTrendingJobs(limit);

        List<UserSearchHistory> searchHistories =
                searchHistoryRepository.findByAccountIdOrderByCreatedAtDesc(
                        userId, PageRequest.of(0, 10));

        BehavioralProfile profile = buildBehavioralProfile(userId);
        double[] cvVec = loadCvEmbedding(userId);

        List<ScoredJob> scored = pool.stream()
                .map(job -> new ScoredJob(job, calculateScore(job, searchHistories, profile, cvVec)))
                .sorted(Comparator.comparingDouble(ScoredJob::score).reversed())
                .collect(Collectors.toList());

        return applyDiversityAndLimit(scored, limit);
    }

    // =================================================================
    // HYBRID
    // =================================================================

    private List<JobResponse> recommendHybrid(Long userId, int limit) {
        // 1. Collaborative pool
        List<Long> collabIds = interactionRepository.findSuggestedJobsByUserInterest(
                userId, PageRequest.of(0, limit * 2));
        Set<Long> appliedIds = interactionRepository.findAppliedJobIds(userId);
        List<Job> collabJobs = jobRepository.findAllById(collabIds).stream()
                .filter(j -> j.getStatus() == JobStatus.ACTIVE)
                .filter(j -> j.getCompany() != null && Boolean.TRUE.equals(j.getCompany().getActive()))
                .filter(this::isNotExpired)
                .filter(j -> !appliedIds.contains(j.getId()))
                .collect(Collectors.toList());

        // 2. Content-based scored result (đã filter applied + expired trong candidatePool)
        List<JobResponse> contentBased = recommendByContent(userId, limit * 2);

        // 3. Trending để đảm bảo diversity / coverage
        List<JobResponse> trending = getTrendingJobs(limit);

        // 4. Trộn theo trọng số thích nghi:
        //    - Collab pool nhỏ (< 5) → ưu tiên content
        //    - Collab pool lớn → 35% collab / 50% content / 15% trending
        int collabSlots, contentSlots;
        if (collabJobs.size() < 5) {
            collabSlots = Math.min(collabJobs.size(), Math.max(1, limit / 5));
            contentSlots = Math.max(1, limit - collabSlots - Math.max(1, limit / 6));
        } else {
            collabSlots = (int) Math.round(limit * 0.35);
            contentSlots = (int) Math.round(limit * 0.50);
        }

        Set<Long> seen = new HashSet<>();
        List<JobResponse> result = new ArrayList<>();

        // Pick collaborative
        for (Job j : collabJobs) {
            if (result.size() >= collabSlots) break;
            if (seen.add(j.getId())) {
                JobResponse r = JobResponse.fromEntity(j);
                if (r.getCompanyName() != null) result.add(r);
            }
        }

        // Pick content
        int contentTarget = result.size() + contentSlots;
        for (JobResponse r : contentBased) {
            if (result.size() >= contentTarget) break;
            if (r.getCompanyName() != null && seen.add(r.getId())) result.add(r);
        }

        // Fill trending
        for (JobResponse r : trending) {
            if (result.size() >= limit) break;
            if (r.getCompanyName() != null && seen.add(r.getId())) result.add(r);
        }

        return result;
    }

    // =================================================================
    // CANDIDATE POOL
    // =================================================================

    private List<Job> candidatePool(Long userId) {
        Set<Long> applied = userId == null
                ? Collections.emptySet()
                : interactionRepository.findAppliedJobIds(userId);

        return jobRepository
                .findActiveCandidatesForRecommendation(PageRequest.of(0, CANDIDATE_POOL_SIZE))
                .stream()
                .filter(j -> !applied.contains(j.getId()))
                .collect(Collectors.toList());
    }

    private boolean isNotExpired(Job j) {
        LocalDate due = j.getDueDate();
        return due == null || !due.isBefore(LocalDate.now());
    }

    // =================================================================
    // BEHAVIORAL PROFILE — có time decay
    // =================================================================

    private BehavioralProfile buildBehavioralProfile(Long userId) {
        Map<String, Double> skillPref = new HashMap<>();
        Map<String, Double> locPref = new HashMap<>();
        Map<JobType, Double> jobTypePref = new HashMap<>();
        Map<ExperienceLevel, Double> expPref = new HashMap<>();
        Map<Long, Double> companyPref = new HashMap<>();
        List<BigDecimal> salaryAnchors = new ArrayList<>();

        try {
            List<UserJobInteraction> interactions = interactionRepository
                    .findRecentInteractionsWithJobs(userId, PageRequest.of(0, 30));

            for (UserJobInteraction interaction : interactions) {
                Job job = interaction.getJob();
                if (job == null) continue;

                double rawWeight = interaction.getWeight() == null ? 1 : interaction.getWeight();
                double decay = timeDecay(interaction.getCreatedAt(), BEHAVIOR_HALFLIFE_DAYS);
                double w = rawWeight * decay;

                // Skills
                if (job.getSkills() != null) {
                    for (String s : job.getSkills()) {
                        skillPref.merge(normalize(s), w, Double::sum);
                    }
                }
                // Title tokens (giá trị thấp hơn skills)
                if (job.getTitle() != null) {
                    for (String tok : job.getTitle().toLowerCase().split("\\s+")) {
                        if (tok.length() >= 3) skillPref.merge(tok, w * 0.4, Double::sum);
                    }
                }
                // Location
                if (job.getProvince() != null) {
                    locPref.merge(normalize(job.getProvince()), w, Double::sum);
                }
                // Job type
                if (job.getJobType() != null) {
                    jobTypePref.merge(job.getJobType(), w, Double::sum);
                }
                // Experience level
                if (job.getExperienceLevel() != null) {
                    expPref.merge(job.getExperienceLevel(), w, Double::sum);
                }
                // Company affinity (chỉ tính SAVE/APPLY — VIEW không đủ tin cậy)
                if (job.getCompany() != null && rawWeight >= 3) {
                    companyPref.merge(job.getCompany().getId(), w, Double::sum);
                }
                // Salary anchor — chỉ lấy từ APPLY
                if (rawWeight >= 5) {
                    if (job.getMinSalary() != null) salaryAnchors.add(job.getMinSalary());
                    if (job.getMaxSalary() != null) salaryAnchors.add(job.getMaxSalary());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to build behavioral profile for user {}: {}", userId, e.getMessage());
        }

        BigDecimal salaryAnchor = null;
        if (!salaryAnchors.isEmpty()) {
            BigDecimal sum = BigDecimal.ZERO;
            for (BigDecimal s : salaryAnchors) sum = sum.add(s);
            salaryAnchor = sum.divide(BigDecimal.valueOf(salaryAnchors.size()),
                    java.math.RoundingMode.HALF_UP);
        }

        return new BehavioralProfile(skillPref, locPref, jobTypePref, expPref, companyPref, salaryAnchor);
    }

    // =================================================================
    // SCORING — 9 yếu tố, normalize [0,1] × weight
    // =================================================================

    private double calculateScore(Job job, List<UserSearchHistory> histories,
                                  BehavioralProfile profile, double[] cvVec) {
        double total = 0.0;

        // 1. Semantic similarity (CV ↔ job embedding)
        if (cvVec != null && job.getJobEmbedding() != null) {
            double[] jobVec = jobEmbeddingService.parseEmbedding(job.getJobEmbedding());
            if (jobVec != null) {
                double sim = cosine(cvVec, jobVec);
                // sim ∈ [-1,1]; clamp âm về 0
                total += Math.max(0.0, sim) * W_SEMANTIC;
            }
        }

        // 2. Search history (de-dup keyword)
        total += scoreSearchHistory(job, histories) * W_SEARCH;

        // 3. Skill preference
        total += scoreSkillPreference(job, profile) * W_SKILL;

        // 4. Location preference
        total += scoreLocationPreference(job, profile) * W_LOCATION;

        // 5. Job type
        total += scoreEnumPreference(job.getJobType(), profile.jobTypePref) * W_JOBTYPE;

        // 6. Experience level
        total += scoreEnumPreference(job.getExperienceLevel(), profile.expPref) * W_EXP;

        // 7. Salary fit
        total += scoreSalaryFit(job, histories, profile) * W_SALARY;

        // 8. Freshness (job mới đăng < 30 ngày)
        total += scoreFreshness(job) * W_FRESH;

        // 9. Featured flag
        if (Boolean.TRUE.equals(job.getFeatured())) total += W_FEATURED;

        // Bonus nhỏ cho công ty user đã quan tâm trước đó
        if (job.getCompany() != null && profile.companyPref.containsKey(job.getCompany().getId())) {
            total += 2.0;
        }

        return total;
    }

    /** Match keyword/location đã search trong 10 lần gần nhất (de-dup keyword). */
    private double scoreSearchHistory(Job job, List<UserSearchHistory> histories) {
        if (histories == null || histories.isEmpty()) return 0.0;

        Set<String> seenKeywords = new HashSet<>();
        Set<String> seenLocations = new HashSet<>();
        double titleMatch = 0, skillMatch = 0, locMatch = 0;

        for (UserSearchHistory h : histories) {
            String kw = h.getKeyword() == null ? null : h.getKeyword().trim().toLowerCase();
            if (kw != null && !kw.isEmpty() && seenKeywords.add(kw)) {
                if (job.getTitle() != null && job.getTitle().toLowerCase().contains(kw)) titleMatch = 1.0;
                if (job.getSkills() != null && job.getSkills().stream()
                        .anyMatch(s -> s.toLowerCase().contains(kw))) skillMatch = 1.0;
            }
            String loc = h.getLocation() == null ? null : normalize(h.getLocation());
            if (loc != null && !loc.isEmpty() && seenLocations.add(loc)) {
                if (job.getProvince() != null && normalize(job.getProvince()).equals(loc)) locMatch = 1.0;
            }
        }

        // Trọng số nội bộ: title (0.5) + skill (0.3) + location (0.2)
        return Math.min(1.0, titleMatch * 0.5 + skillMatch * 0.3 + locMatch * 0.2);
    }

    private double scoreSkillPreference(Job job, BehavioralProfile profile) {
        if (job.getSkills() == null || profile.skillPref.isEmpty()) return 0.0;
        double maxPref = profile.skillPref.values().stream().max(Double::compareTo).orElse(1.0);
        if (maxPref <= 0) return 0.0;

        double sum = 0.0;
        int matched = 0;
        for (String s : job.getSkills()) {
            Double p = profile.skillPref.get(normalize(s));
            if (p != null) {
                sum += p / maxPref; // normalize từng skill về [0,1]
                matched++;
            }
        }
        if (matched == 0) return 0.0;
        // Trung bình các skill match, kèm bonus số lượng (tối đa 5 skill match)
        double avg = sum / matched;
        double countBonus = Math.min(matched, 5) / 5.0;
        return Math.min(1.0, avg * 0.7 + countBonus * 0.3);
    }

    private double scoreLocationPreference(Job job, BehavioralProfile profile) {
        if (job.getProvince() == null || profile.locPref.isEmpty()) return 0.0;
        double maxPref = profile.locPref.values().stream().max(Double::compareTo).orElse(1.0);
        if (maxPref <= 0) return 0.0;

        Double p = profile.locPref.get(normalize(job.getProvince()));
        return p == null ? 0.0 : Math.min(1.0, p / maxPref);
    }

    private <T> double scoreEnumPreference(T value, Map<T, Double> pref) {
        if (value == null || pref == null || pref.isEmpty()) return 0.0;
        double maxPref = pref.values().stream().max(Double::compareTo).orElse(1.0);
        if (maxPref <= 0) return 0.0;
        Double p = pref.get(value);
        return p == null ? 0.0 : Math.min(1.0, p / maxPref);
    }

    /** Salary fit: so với salary user search hoặc anchor từ job đã apply. */
    private double scoreSalaryFit(Job job, List<UserSearchHistory> histories, BehavioralProfile profile) {
        BigDecimal jobMid = midSalary(job.getMinSalary(), job.getMaxSalary());
        if (jobMid == null) return 0.0;

        // Ưu tiên salary user search trực tiếp
        BigDecimal target = null;
        for (UserSearchHistory h : histories) {
            BigDecimal mid = midSalary(h.getSalaryMin(), h.getSalaryMax());
            if (mid != null) { target = mid; break; }
        }
        if (target == null) target = profile.salaryAnchor;
        if (target == null || target.signum() == 0) return 0.0;

        double diff = Math.abs(jobMid.doubleValue() - target.doubleValue());
        double rel = diff / target.doubleValue();
        // 0% diff → 1.0; 50% diff → 0.5; >100% → 0
        return Math.max(0.0, 1.0 - rel);
    }

    /** Job đăng càng mới càng cao điểm. */
    private double scoreFreshness(Job job) {
        if (job.getCreatedAt() == null) return 0.0;
        long days = ChronoUnit.DAYS.between(job.getCreatedAt(), LocalDateTime.now());
        if (days <= 0) return 1.0;
        if (days >= 30) return 0.0;
        return 1.0 - (days / 30.0);
    }

    // =================================================================
    // DIVERSITY — giới hạn số job mỗi công ty trong top
    // =================================================================

    private List<JobResponse> applyDiversityAndLimit(List<ScoredJob> scored, int limit) {
        Map<Long, Integer> companyCount = new HashMap<>();
        List<ScoredJob> rescored = new ArrayList<>(scored.size());

        for (ScoredJob sj : scored) {
            Long companyId = sj.job().getCompany() == null ? null : sj.job().getCompany().getId();
            int count = companyId == null ? 0 : companyCount.getOrDefault(companyId, 0);
            double finalScore = sj.score();
            if (count >= MAX_PER_COMPANY) {
                finalScore *= Math.pow(DIVERSITY_PENALTY, count - MAX_PER_COMPANY + 1);
            }
            rescored.add(new ScoredJob(sj.job(), finalScore));
            if (companyId != null) companyCount.merge(companyId, 1, Integer::sum);
        }

        return rescored.stream()
                .sorted(Comparator.comparingDouble(ScoredJob::score).reversed())
                .limit(limit)
                .map(sj -> JobResponse.fromEntity(sj.job()))
                .filter(r -> r.getCompanyName() != null)
                .collect(Collectors.toList());
    }

    // =================================================================
    // HELPERS
    // =================================================================

    private double[] loadCvEmbedding(Long userId) {
        try {
            List<String> embeddings = cvRepository.findActiveCvEmbeddingByProfileId(userId, PageRequest.of(0, 1));
            if (embeddings.isEmpty()) return null;
            return jobEmbeddingService.parseEmbedding(embeddings.get(0));
        } catch (Exception e) {
            log.debug("Cannot load CV embedding for user {}: {}", userId, e.getMessage());
            return null;
        }
    }

    private static double cosine(double[] a, double[] b) {
        if (a == null || b == null || a.length == 0 || a.length != b.length) return 0.0;
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) return 0.0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    private static String normalize(String s) {
        return s == null ? "" : s.toLowerCase().trim();
    }

    private static BigDecimal midSalary(BigDecimal min, BigDecimal max) {
        if (min == null && max == null) return null;
        if (min == null) return max;
        if (max == null) return min;
        return min.add(max).divide(BigDecimal.valueOf(2), java.math.RoundingMode.HALF_UP);
    }

    /** Hàm decay theo bán-rã (half-life) tính bằng ngày. */
    private static double timeDecay(LocalDateTime t, double halfLifeDays) {
        if (t == null) return 1.0;
        long days = Math.max(0, ChronoUnit.DAYS.between(t, LocalDateTime.now()));
        return Math.exp(-Math.log(2) * days / halfLifeDays);
    }

    // =================================================================
    // DTOs
    // =================================================================

    private record BehavioralProfile(
            Map<String, Double> skillPref,
            Map<String, Double> locPref,
            Map<JobType, Double> jobTypePref,
            Map<ExperienceLevel, Double> expPref,
            Map<Long, Double> companyPref,
            BigDecimal salaryAnchor
    ) {}

    private record ScoredJob(Job job, double score) {}
}

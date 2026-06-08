package com.iting.jobportal.userprofile.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.KnowledgeGraphService;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.request.MatchByJobRequest;
import com.iting.jobportal.userprofile.dto.response.CandidateFullProfileResponse;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import com.iting.jobportal.userprofile.entity.Education;
import com.iting.jobportal.userprofile.entity.Skill;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.EmployerCandidateSearchService;
import com.iting.jobportal.userprofile.service.embedding.EmbeddingClient;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployerCandidateSearchServiceImpl implements EmployerCandidateSearchService {

  private final UserProfileRepository userProfileRepository;
  private final CVRepository cvRepository;
  private final EmbeddingClient embeddingClient;
  private final ObjectMapper objectMapper;
  private final KnowledgeGraphService knowledgeGraphService;
  private final JobRepository jobRepository;
  private final JobEmbeddingService jobEmbeddingService;

  @Override
  @Transactional(readOnly = true)
  public Page<EmployerCandidateSearchResponse> search(EmployerCandidateSearchRequest request) {
    int page = request.getPage() == null ? 0 : Math.max(0, request.getPage());
    int size = request.getSize() == null ? 10 : Math.max(1, Math.min(50, request.getSize()));

    String keyword = normalizeAllValue(request.getKeyword());
    String position = normalizeAllValue(request.getPosition());
    String level = normalizeAllValue(request.getLevel());
    String location = normalizeAllValue(request.getLocation());
    String degree = normalizeAllValue(request.getDegree());

    boolean onlyAvailable = Boolean.TRUE.equals(request.getOnlyAvailable());
    List<String> skills =
        request.getSkills() == null
            ? List.of()
            : request.getSkills().stream()
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .toList();

    ExperienceRange expRange = ExperienceRange.fromRaw(normalizeAllValue(request.getExperience()));
    ExperienceRange levelRange = ExperienceRange.fromLevel(level);

    // Combine ranges (intersection)
    Integer minExp = combineMin(expRange.minYears(), levelRange.minYears());
    Integer maxExp = combineMax(expRange.maxYears(), levelRange.maxYears());

    List<UserProfile> matched =
        userProfileRepository.employerSearchCandidates(
            keyword,
            position,
            location,
            onlyAvailable,
            minExp,
            maxExp,
            degree,
            skills.isEmpty(),
            skills.isEmpty() ? List.of("__EMPTY__") : skills);

    // ===== KG Expansion: mở rộng keyword bằng Knowledge Graph =====
    java.util.Set<String> expandedKeywords = new java.util.HashSet<>();
    if (keyword != null && !keyword.isBlank()) {
      expandedKeywords = knowledgeGraphService.expandKeyword(keyword);
    }

    String employerLocation = request.getEmployerLocation();
    String industryContext = request.getIndustryContext();

    Optional<double[]> queryEmbedding = Optional.empty();
    if (keyword != null && !keyword.isBlank()) {
      queryEmbedding = embeddingClient.embed(keyword);
    } else if (industryContext != null && !industryContext.isBlank()) {
      queryEmbedding = embeddingClient.embed(industryContext);
    }

    // Location weight: location score [0..1] -> contributes up to +2.0 bonus to
    // overall score
    // This ensures same-city candidates rank significantly higher than those in
    // different regions
    final double LOCATION_WEIGHT = 2.0;

    List<ScoredCandidate> scored = new ArrayList<>(matched.size());
    for (UserProfile profile : matched) {
      var user = profile.getUser();
      var account = user == null ? null : user.getAccount();

      double score = 0.0;
      if (queryEmbedding.isPresent()) {
        List<String> cvEmb =
            cvRepository.findActiveCvEmbeddingByProfileId(profile.getId(), PageRequest.of(0, 1));
        String candidateEmbedding = cvEmb.isEmpty() ? null : cvEmb.get(0);
        score =
            cosineSimilarity(queryEmbedding.get(), parseEmbedding(candidateEmbedding).orElse(null));
      } else if (keyword != null && !keyword.isBlank()) {
        score =
            heuristicKeywordScore(
                keyword,
                account != null ? account.getFullName() : null,
                profile.getHeadline(),
                profile.getShortBio(),
                profile.getSkills());
      }

      // KG Bonus: tăng điểm cho candidate có skill liên quan qua Knowledge Graph
      if (!expandedKeywords.isEmpty() && profile.getSkills() != null) {
        for (com.iting.jobportal.userprofile.entity.Skill s : profile.getSkills()) {
          if (s.getName() != null
              && expandedKeywords.stream()
                  .anyMatch(ek -> s.getName().toLowerCase().contains(ek.toLowerCase()))) {
            score += 0.5; // KG relationship bonus
          }
        }
      }

      // ─── Location Proximity Score (KG-based) ───────────────────────
      // Only apply when employer location is known
      if (employerLocation != null && !employerLocation.isBlank()) {
        double locScore =
            knowledgeGraphService.locationScore(employerLocation, profile.getLocation());
        score += LOCATION_WEIGHT * locScore;
      }

      scored.add(new ScoredCandidate(profile, score));
    }

    // Sort by score desc when we have any meaningful signal (keyword OR location OR
    // industry).
    // Fall back to updatedAt desc only when there is no ranking signal at all.
    boolean hasRankingSignal =
        (keyword != null && !keyword.isBlank())
            || (employerLocation != null && !employerLocation.isBlank())
            || (industryContext != null && !industryContext.isBlank());

    Comparator<ScoredCandidate> comparator =
        hasRankingSignal
            ? Comparator.comparing(ScoredCandidate::score).reversed()
            : Comparator.comparing(
                    (ScoredCandidate c) -> c.profile().getUpdatedAt(),
                    Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed();

    scored.sort(comparator.thenComparing(c -> c.profile().getId()));

    int fromIndex = Math.min(page * size, scored.size());
    int toIndex = Math.min(fromIndex + size, scored.size());

    // Phase 5: Explainability - collect search keyword skills for KG explanation
    List<String> searchSkills = new ArrayList<>();
    if (keyword != null) searchSkills.add(keyword);
    searchSkills.addAll(skills);

    List<EmployerCandidateSearchResponse> content =
        scored.subList(fromIndex, toIndex).stream()
            .map(sc -> toResponse(sc.profile(), sc.score(), searchSkills))
            .collect(Collectors.toList());

    return new PageImpl<>(content, PageRequest.of(page, size), scored.size());
  }

  @Override
  @Transactional(readOnly = true)
  public Page<EmployerCandidateSearchResponse> searchByJob(Long jobId, MatchByJobRequest request) {
    if (jobId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jobId không được rỗng");
    }
    int page = request == null || request.getPage() == null ? 0 : Math.max(0, request.getPage());
    int size =
        request == null || request.getSize() == null
            ? 20
            : Math.max(1, Math.min(50, request.getSize()));

    Job job =
        jobRepository
            .findById(jobId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job không tồn tại"));

    // ── Lấy job embedding (lazy compute nếu null) ──
    double[] jobVec = parseEmbedding(job.getJobEmbedding()).orElse(null);
    if (jobVec == null || jobVec.length == 0) {
      try {
        boolean ok = jobEmbeddingService.embedJob(job);
        if (ok) {
          Job reloaded = jobRepository.findById(jobId).orElse(job);
          jobVec = parseEmbedding(reloaded.getJobEmbedding()).orElse(null);
        }
      } catch (Exception e) {
        log.warn("[matchByJob] Embed job sync failed for jobId={}: {}", jobId, e.getMessage());
      }
    }

    // ── Build filter từ job fields ──
    // QUAN TRỌNG: filter SQL phải LỎNG cho AI match — strict skill IN / exp range
    // chặn quá nhiều candidate. Để vector cosine + KG bonus rank tự nhiên.
    String locationHint =
        (request != null
                && request.getLocationOverride() != null
                && !request.getLocationOverride().isBlank())
            ? request.getLocationOverride().trim()
            : job.getProvince();
    List<String> jobSkills =
        job.getSkills() == null
            ? List.of()
            : job.getSkills().stream().filter(s -> s != null && !s.isBlank()).distinct().toList();

    // SQL chỉ filter openToWork=true + có role candidate. Mọi gating khác bỏ
    // qua: không truyền skills (exact-match IN), không truyền exp range (chặn
    // theo level cứng), không truyền location (để KG location bonus xử lý).
    List<UserProfile> matched =
        userProfileRepository.employerSearchCandidates(
            null, // keyword
            null, // position
            null, // location → KG locScore handle proximity
            true, // onlyAvailable
            null, // minExp
            null, // maxExp
            null, // degree
            true, // skillsEmpty=true → bỏ qua skill IN filter
            List.of("__EMPTY__"));

    // ── KG expansion từ job skills để bonus ──
    java.util.Set<String> expandedKeywords = new java.util.HashSet<>();
    for (String s : jobSkills) {
      expandedKeywords.addAll(knowledgeGraphService.expandKeyword(s));
    }

    final double LOCATION_WEIGHT = 2.0;
    final double[] finalJobVec = jobVec; // for lambda capture

    List<ScoredCandidate> scored = new ArrayList<>(matched.size());
    for (UserProfile profile : matched) {
      double cosine = 0.0;
      if (finalJobVec != null) {
        cosine = cosineSimilarity(finalJobVec, candidateVector(profile, finalJobVec.length));
      }

      double score = cosine;

      // KG skill bonus
      int skillMatchCount = 0;
      if (!expandedKeywords.isEmpty() && profile.getSkills() != null) {
        for (Skill s : profile.getSkills()) {
          if (s.getName() != null
              && expandedKeywords.stream()
                  .anyMatch(ek -> s.getName().toLowerCase().contains(ek.toLowerCase()))) {
            score += 0.3;
            skillMatchCount++;
          }
        }
      }

      // Location proximity bonus (dùng locationHint từ job.province)
      double locScore = 0.0;
      if (locationHint != null && !locationHint.isBlank()) {
        locScore = knowledgeGraphService.locationScore(locationHint, profile.getLocation());
        score += LOCATION_WEIGHT * locScore;
      }

      scored.add(new ScoredCandidate(profile, score, cosine, skillMatchCount, locScore));
    }

    // Sort by combined score DESC
    scored.sort(
        Comparator.comparing(ScoredCandidate::score)
            .reversed()
            .thenComparing(c -> c.profile().getId()));

    int fromIndex = Math.min(page * size, scored.size());
    int toIndex = Math.min(fromIndex + size, scored.size());

    List<EmployerCandidateSearchResponse> content =
        scored.subList(fromIndex, toIndex).stream()
            .map(sc -> toJobMatchResponse(sc, job, jobSkills))
            .collect(Collectors.toList());

    return new PageImpl<>(content, PageRequest.of(page, size), scored.size());
  }

  private EmployerCandidateSearchResponse toJobMatchResponse(
      ScoredCandidate sc, Job job, List<String> jobSkills) {
    UserProfile profile = sc.profile();
    var account = profile.getUser().getAccount();

    List<String> candidateSkills =
        profile.getSkills() == null
            ? List.of()
            : profile.getSkills().stream()
                .map(Skill::getName)
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .toList();

    // Build matchReasons từ signals đã tính
    List<String> reasons = new ArrayList<>();
    if (sc.cosine() > 0) {
      reasons.add(
          String.format(
              Locale.ROOT, "Match nội dung CV: %.0f%%", Math.min(1.0, sc.cosine()) * 100));
    }
    if (sc.skillMatchCount() > 0 && !jobSkills.isEmpty()) {
      reasons.add(
          String.format("Khớp %d/%d kỹ năng yêu cầu", sc.skillMatchCount(), jobSkills.size()));
    }
    if (sc.locScore() > 0.7 && job.getProvince() != null) {
      reasons.add("Cùng địa điểm " + job.getProvince());
    } else if (sc.locScore() > 0.3) {
      reasons.add("Địa điểm gần " + job.getProvince());
    }
    Integer years = profile.getTotalExperienceYears();
    if (years != null && job.getExperienceLevel() != null) {
      reasons.add(
          String.format(
              "%d năm kinh nghiệm phù hợp cấp %s", years, job.getExperienceLevel().name()));
    }

    return EmployerCandidateSearchResponse.builder()
        .id(profile.getId())
        .name(account != null ? account.getFullName() : null)
        .email(account == null ? null : account.getEmail())
        .title(nullToEmpty(profile.getHeadline()))
        .level(deriveLevel(years))
        .location(nullToEmpty(profile.getLocation()))
        .experience(years == null ? 0 : years)
        .degree(pickDegree(profile.getEducations()))
        .education(
            profile.getEducationSummary() != null
                ? profile.getEducationSummary().getDescription()
                : "")
        .workType("")
        .salaryExpectation("")
        .skills(candidateSkills)
        .summary(nullToEmpty(profile.getShortBio()))
        .isAvailable(Boolean.TRUE.equals(profile.getOpenToWork()))
        .score(sc.score())
        .matchReasons(reasons)
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public CandidateFullProfileResponse getCandidateFullProfile(Long candidateId) {
    UserProfile profile =
        userProfileRepository
            .findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));

    // Eagerly fetch collections by accessing them to avoid
    // LazyInitializationException
    profile.getSkills().size();
    profile.getWorkExperiences().size();
    profile.getEducations().size();
    profile.getCertifications().size();
    profile.getExternalLinks().size();
    profile.getPortfolios().size();

    return CandidateFullProfileResponse.builder()
        .profile(profile)
        .skills(profile.getSkills())
        .experiences(profile.getWorkExperiences())
        .educations(profile.getEducations())
        .certificates(profile.getCertifications())
        .socialLinks(profile.getExternalLinks())
        .portfolios(profile.getPortfolios())
        .build();
  }

  private EmployerCandidateSearchResponse toResponse(
      UserProfile profile, double score, List<String> searchSkills) {
    var user = profile.getUser();
    var account = user == null ? null : user.getAccount();

    List<String> skills =
        profile.getSkills() == null
            ? List.of()
            : profile.getSkills().stream()
                .map(Skill::getName)
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .toList();

    String degree = pickDegree(profile.getEducations());
    Integer expYears = profile.getTotalExperienceYears();

    // Phase 5: Generate explainability reasons via KG
    List<String> matchReasons = List.of();
    if (searchSkills != null && !searchSkills.isEmpty() && !skills.isEmpty()) {
      matchReasons = knowledgeGraphService.explainMatch(skills, searchSkills);
    }

    return EmployerCandidateSearchResponse.builder()
        .id(profile.getId())
        .name(account != null ? account.getFullName() : null)
        .email(account == null ? null : account.getEmail())
        .title(nullToEmpty(profile.getHeadline()))
        .level(deriveLevel(expYears))
        .location(nullToEmpty(profile.getLocation()))
        .experience(expYears == null ? 0 : expYears)
        .degree(degree)
        .education(
            profile.getEducationSummary() != null
                ? profile.getEducationSummary().getDescription()
                : "")
        .workType("")
        .salaryExpectation("")
        .skills(skills)
        .summary(nullToEmpty(profile.getShortBio()))
        .isAvailable(Boolean.TRUE.equals(profile.getOpenToWork()))
        .score(score)
        .matchReasons(matchReasons)
        .build();
  }

  private String pickDegree(List<Education> educations) {
    if (educations == null) return "";
    return educations.stream()
        .map(Education::getDegree)
        .filter(d -> d != null && !d.isBlank())
        .findFirst()
        .orElse("");
  }

  private static String deriveLevel(Integer expYears) {
    if (expYears == null) return "N/A";
    if (expYears <= 0) return "FRESHER";
    if (expYears <= 2) return "JUNIOR";
    if (expYears <= 4) return "MIDDLE";
    if (expYears <= 7) return "SENIOR";
    return "EXPERT";
  }

  private Optional<double[]> parseEmbedding(String raw) {
    if (raw == null || raw.isBlank()) return Optional.empty();
    try {
      List<Double> values = objectMapper.readValue(raw, new TypeReference<>() {});
      double[] arr = new double[values.size()];
      for (int i = 0; i < values.size(); i++) {
        arr[i] = values.get(i) == null ? 0.0 : values.get(i);
      }
      return Optional.of(arr);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  /**
   * Vector embedding của ứng viên để so khớp với job. Ưu tiên CV embedding đã lưu nếu CÙNG số chiều
   * với job vector; nếu chưa có CV embedding (hoặc lệch chiều do nhúng bằng model khác), nhúng
   * on-the-fly từ văn bản hồ sơ (headline + kỹ năng + khu vực + bio) bằng CÙNG EmbeddingClient với
   * job ⇒ cùng không gian vector ⇒ cosine có ý nghĩa kể cả khi CV chưa được nhúng.
   */
  private double[] candidateVector(UserProfile profile, int targetDim) {
    List<String> cvEmb =
        cvRepository.findActiveCvEmbeddingByProfileId(profile.getId(), PageRequest.of(0, 1));
    if (!cvEmb.isEmpty()) {
      double[] stored = parseEmbedding(cvEmb.get(0)).orElse(null);
      if (stored != null && stored.length == targetDim) return stored;
    }
    return embeddingClient.embed(buildCandidateText(profile)).orElse(null);
  }

  private String buildCandidateText(UserProfile profile) {
    StringBuilder sb = new StringBuilder();
    if (profile.getHeadline() != null && !profile.getHeadline().isBlank()) {
      sb.append(profile.getHeadline()).append(". ");
    }
    if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
      String skills =
          profile.getSkills().stream()
              .map(Skill::getName)
              .filter(s -> s != null && !s.isBlank())
              .collect(Collectors.joining(", "));
      if (!skills.isBlank()) sb.append("Kỹ năng: ").append(skills).append(". ");
    }
    if (profile.getLocation() != null && !profile.getLocation().isBlank()) {
      sb.append("Khu vực: ").append(profile.getLocation()).append(". ");
    }
    if (profile.getShortBio() != null && !profile.getShortBio().isBlank()) {
      sb.append(profile.getShortBio());
    }
    return sb.toString();
  }

  private static double cosineSimilarity(double[] a, double[] b) {
    if (a == null || b == null) return 0.0;
    if (a.length == 0 || b.length == 0) return 0.0;
    if (a.length != b.length) return 0.0;

    double dot = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    for (int i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA == 0.0 || normB == 0.0) return 0.0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private static double heuristicKeywordScore(
      String keyword, String name, String headline, String bio, List<Skill> skills) {
    String kw = keyword.toLowerCase(Locale.ROOT).trim();
    if (kw.isEmpty()) return 0.0;

    double score = 0.0;
    score += containsBoost(name, kw, 2.0);
    score += containsBoost(headline, kw, 1.5);
    score += containsBoost(bio, kw, 1.0);

    if (skills != null) {
      for (Skill s : skills) {
        score += containsBoost(s.getName(), kw, 0.8);
      }
    }
    return score;
  }

  private static double containsBoost(String value, String kw, double weight) {
    if (value == null || value.isBlank()) return 0.0;
    return value.toLowerCase(Locale.ROOT).contains(kw) ? weight : 0.0;
  }

  private static String normalizeAllValue(String value) {
    if (value == null) return null;
    String v = value.trim();
    if (v.isEmpty()) return null;
    return "all".equalsIgnoreCase(v) ? null : v;
  }

  private static String nullToEmpty(String value) {
    return value == null ? "" : value;
  }

  private record ScoredCandidate(
      UserProfile profile, double score, double cosine, int skillMatchCount, double locScore) {
    ScoredCandidate(UserProfile profile, double score) {
      this(profile, score, 0.0, 0, 0.0);
    }
  }

  private static Integer combineMin(Integer a, Integer b) {
    if (a == null) return b;
    if (b == null) return a;
    return Math.max(a, b);
  }

  private static Integer combineMax(Integer a, Integer b) {
    if (a == null) return b;
    if (b == null) return a;
    return Math.min(a, b);
  }

  private record ExperienceRange(Integer minYears, Integer maxYears) {
    static ExperienceRange fromRaw(String raw) {
      if (raw == null || raw.isBlank()) return new ExperienceRange(null, null);
      if ("0".equals(raw)) return new ExperienceRange(0, 0);
      if ("10+".equals(raw)) return new ExperienceRange(10, null);
      if (!raw.contains("-")) return new ExperienceRange(null, null);
      try {
        String[] parts = raw.split("-");
        Integer min = Integer.parseInt(parts[0].trim());
        Integer max = Integer.parseInt(parts[1].trim());
        return new ExperienceRange(min, max);
      } catch (Exception e) {
        return new ExperienceRange(null, null);
      }
    }

    static ExperienceRange fromLevel(String level) {
      if (level == null) return new ExperienceRange(null, null);
      return switch (level.toUpperCase()) {
        case "INTERN", "FRESHER" -> new ExperienceRange(0, 0);
        case "JUNIOR" -> new ExperienceRange(1, 2);
        case "MIDDLE", "MID_LEVEL" -> new ExperienceRange(3, 4);
        case "SENIOR" -> new ExperienceRange(5, 7);
        case "LEAD", "EXPERT", "MANAGER" -> new ExperienceRange(8, null);
        default -> new ExperienceRange(null, null);
      };
    }
  }
}

package com.iting.jobportal.userprofile.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.userprofile.dto.request.EmployerCandidateSearchRequest;
import com.iting.jobportal.userprofile.dto.response.EmployerCandidateSearchResponse;
import com.iting.jobportal.userprofile.entity.Education;
import com.iting.jobportal.userprofile.entity.Skill;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.EmployerCandidateSearchService;
import com.iting.jobportal.userprofile.service.embedding.EmbeddingClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerCandidateSearchServiceImpl implements EmployerCandidateSearchService {

    private final UserProfileRepository userProfileRepository;
    private final EmbeddingClient embeddingClient;
    private final ObjectMapper objectMapper;

    @Override
    public Page<EmployerCandidateSearchResponse> search(EmployerCandidateSearchRequest request) {
        int page = request.getPage() == null ? 0 : Math.max(0, request.getPage());
        int size = request.getSize() == null ? 10 : Math.max(1, Math.min(50, request.getSize()));

        String keyword = normalizeAllValue(request.getKeyword());
        String position = normalizeAllValue(request.getPosition());
        String location = normalizeAllValue(request.getLocation());
        String degree = normalizeAllValue(request.getDegree());

        boolean onlyAvailable = Boolean.TRUE.equals(request.getOnlyAvailable());
        List<String> skills = request.getSkills() == null ? List.of() : request.getSkills().stream()
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .toList();

        ExperienceRange expRange = ExperienceRange.fromRaw(normalizeAllValue(request.getExperience()));

        List<UserProfile> matched = userProfileRepository.employerSearchCandidates(
                keyword,
                position,
                location,
                onlyAvailable,
                expRange.minYears(),
                expRange.maxYears(),
                degree,
                skills.isEmpty(),
                skills.isEmpty() ? List.of("__EMPTY__") : skills
        );

        Optional<double[]> queryEmbedding = Optional.empty();
        if (keyword != null && !keyword.isBlank()) {
            queryEmbedding = embeddingClient.embed(keyword);
        }

        List<ScoredCandidate> scored = new ArrayList<>(matched.size());
        for (UserProfile profile : matched) {
            var user = profile.getUser();
            var account = user.getAccount();

            double score = 0.0;
            if (queryEmbedding.isPresent()) {
                score = cosineSimilarity(queryEmbedding.get(), parseEmbedding(user.getCvEmbedding()).orElse(null));
            } else if (keyword != null && !keyword.isBlank()) {
                score = heuristicKeywordScore(keyword, user.getFullName(), profile.getHeadline(), profile.getShortBio(), profile.getSkills());
            }

            scored.add(new ScoredCandidate(profile, score));
        }

        // Sort: if keyword is present -> by score desc; else by updatedAt desc (fallback)
        Comparator<ScoredCandidate> comparator = (keyword != null && !keyword.isBlank())
                ? Comparator.comparing(ScoredCandidate::score).reversed()
                : Comparator.comparing((ScoredCandidate c) -> c.profile().getUpdatedAt(), Comparator.nullsLast(Comparator.naturalOrder()))
                    .reversed();

        scored.sort(comparator.thenComparing(c -> c.profile().getId()));

        int fromIndex = Math.min(page * size, scored.size());
        int toIndex = Math.min(fromIndex + size, scored.size());

        List<EmployerCandidateSearchResponse> content = scored.subList(fromIndex, toIndex).stream()
                .map(sc -> toResponse(sc.profile(), sc.score()))
                .collect(Collectors.toList());

        return new PageImpl<>(content, PageRequest.of(page, size), scored.size());
    }

    private EmployerCandidateSearchResponse toResponse(UserProfile profile, double score) {
        var user = profile.getUser();
        var account = user.getAccount();

        List<String> skills = profile.getSkills() == null ? List.of() : profile.getSkills().stream()
                .map(Skill::getName)
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .toList();

        String degree = pickDegree(profile.getEducations());
        Integer expYears = profile.getTotalExperienceYears();

        return EmployerCandidateSearchResponse.builder()
                .id(profile.getId())
                .name(user.getFullName())
                .email(account.getEmail())
                .title(nullToEmpty(profile.getHeadline()))
                .level(deriveLevel(expYears))
                .location(nullToEmpty(profile.getLocation()))
                .experience(expYears == null ? 0 : expYears)
                .degree(degree)
                .education(nullToEmpty(profile.getEducationSummary()))
                .workType("")
                .salaryExpectation("")
                .skills(skills)
                .summary(nullToEmpty(profile.getShortBio()))
                .isAvailable(Boolean.TRUE.equals(profile.getOpenToWork()))
                .score(score)
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

    private static double heuristicKeywordScore(String keyword, String name, String headline, String bio, List<Skill> skills) {
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

    private record ScoredCandidate(UserProfile profile, double score) {}

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
    }
}

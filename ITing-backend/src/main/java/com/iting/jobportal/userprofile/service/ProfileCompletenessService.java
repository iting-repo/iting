package com.iting.jobportal.userprofile.service;

import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Tính điểm hoàn thiện hồ sơ (0–100%) + gợi ý các phần còn thiếu.
 *
 * <p>Mỗi field/section có trọng số riêng (weight). Tổng tối đa = 100.
 * Đầu ra là điểm % + danh sách các bước hành động ("missingItems") cho UI hiển thị.
 */
@Service
@RequiredArgsConstructor
public class ProfileCompletenessService {

    private final UserProfileRepository userProfileRepository;

    /** Weighted scoring config — tổng 100 điểm. */
    private static final List<ScoreItem> SCORE_ITEMS = List.of(
            new ScoreItem("fullName", "Họ và tên", 5),
            new ScoreItem("avatar", "Ảnh đại diện", 5),
            new ScoreItem("headline", "Tiêu đề nghề nghiệp", 5),
            new ScoreItem("bio", "Giới thiệu bản thân", 5),
            new ScoreItem("phone", "Số điện thoại", 5),
            new ScoreItem("location", "Địa điểm", 5),
            new ScoreItem("skills", "Kỹ năng (≥ 3)", 15),
            new ScoreItem("experience", "Kinh nghiệm (≥ 1)", 20),
            new ScoreItem("education", "Học vấn (≥ 1)", 10),
            new ScoreItem("cv", "CV upload", 15),
            new ScoreItem("certification", "Chứng chỉ (≥ 1)", 5),
            new ScoreItem("externalLink", "Link mạng xã hội/portfolio (≥ 1)", 5)
    );

    public Map<String, Object> compute(Long accountId) {
        Optional<UserProfile> profileOpt = userProfileRepository.findByAccountId(accountId);

        if (profileOpt.isEmpty()) {
            return Map.of(
                    "score", 0,
                    "maxScore", 100,
                    "percentage", 0,
                    "level", "Mới bắt đầu",
                    "completedItems", List.of(),
                    "missingItems", buildAllAsMissing()
            );
        }

        UserProfile profile = profileOpt.get();
        int score = 0;
        List<String> completed = new ArrayList<>();
        List<Map<String, Object>> missing = new ArrayList<>();

        for (ScoreItem item : SCORE_ITEMS) {
            boolean done = isItemComplete(item.key, profile);
            if (done) {
                score += item.weight;
                completed.add(item.label);
            } else {
                missing.add(Map.of(
                        "key", item.key,
                        "label", item.label,
                        "weight", item.weight
                ));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", score);
        result.put("maxScore", 100);
        result.put("percentage", score);
        result.put("level", levelFor(score));
        result.put("completedItems", completed);
        result.put("missingItems", missing);
        return result;
    }

    private boolean isItemComplete(String key, UserProfile profile) {
        return switch (key) {
            case "fullName" -> notBlank(profile.getFullName());
            case "avatar" -> notBlank(profile.getAvatarUrl());
            case "headline" -> notBlank(profile.getHeadline());
            case "bio" -> notBlank(profile.getBio()) && profile.getBio().length() >= 50;
            case "phone" -> notBlank(profile.getPhoneNumber());
            case "location" -> notBlank(profile.getLocation());
            case "skills" -> profile.getSkills() != null && profile.getSkills().size() >= 3;
            case "experience" -> profile.getWorkExperiences() != null && !profile.getWorkExperiences().isEmpty();
            case "education" -> profile.getEducations() != null && !profile.getEducations().isEmpty();
            case "cv" -> profile.getCvs() != null && !profile.getCvs().isEmpty();
            case "certification" -> profile.getCertifications() != null && !profile.getCertifications().isEmpty();
            case "externalLink" -> profile.getExternalLinks() != null && !profile.getExternalLinks().isEmpty();
            default -> false;
        };
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private String levelFor(int score) {
        if (score >= 90) return "Xuất sắc";
        if (score >= 70) return "Tốt";
        if (score >= 50) return "Khá";
        if (score >= 25) return "Cần bổ sung";
        return "Mới bắt đầu";
    }

    private List<Map<String, Object>> buildAllAsMissing() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ScoreItem i : SCORE_ITEMS) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("key", i.key);
            m.put("label", i.label);
            m.put("weight", i.weight);
            result.add(m);
        }
        return result;
    }

    private record ScoreItem(String key, String label, int weight) {}
}

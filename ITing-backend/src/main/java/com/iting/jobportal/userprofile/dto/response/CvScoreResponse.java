package com.iting.jobportal.userprofile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvScoreResponse {
    private Long cvId;
    private Integer overallScore;
    private ScoreBreakdown scoreBreakdown;
    private java.util.List<String> strengths;
    private java.util.List<String> improvementAreas;
    private java.util.List<String> criticalIssues;
    private java.util.List<String> recommendations;
    private String evaluationSummary;
    private LocalDateTime scoredAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScoreBreakdown {
        private DimensionScore formatAndReadability;
        private DimensionScore contentQuality;
        private DimensionScore skillAlignment;
        private DimensionScore experienceNarrative;
        private DimensionScore atsCompatibility;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DimensionScore {
        private Integer score;
        private String feedback;
    }
}
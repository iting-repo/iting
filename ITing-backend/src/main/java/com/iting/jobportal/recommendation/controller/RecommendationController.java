package com.iting.jobportal.recommendation.controller;

import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import com.iting.jobportal.recommendation.service.InteractionService;
import com.iting.jobportal.recommendation.service.RecommendationService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "08. Recommendations", description = "APIs hỗ trợ đề xuất việc làm cá nhân hóa")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final InteractionService interactionService;

    @GetMapping("/homepage")
    @Operation(summary = "Lấy danh sách việc làm đề xuất cho trang chủ")
    public ResponseEntity<List<JobResponse>> getHomepageRecommendations(
            @CurrentUser Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.recommendHomepage(userId, limit));
    }

    @PostMapping("/interactions/track")
    @Operation(summary = "Ghi nhận tương tác của người dùng với việc làm")
    public ResponseEntity<?> trackInteraction(
            @CurrentUser Long userId,
            @RequestBody Map<String, Object> request) {
        if (userId == null) return ResponseEntity.ok().build();

        Long jobId = Long.valueOf(request.get("jobId").toString());
        InteractionType type = InteractionType.valueOf(request.get("type").toString());
        
        interactionService.trackInteraction(userId, jobId, type);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/interactions/search")
    @Operation(summary = "Ghi nhận lịch sử tìm kiếm của người dùng")
    public ResponseEntity<?> trackSearch(
            @CurrentUser Long userId,
            @RequestBody Map<String, String> request) {
        if (userId == null) return ResponseEntity.ok().build();

        String keyword = request.get("keyword");
        String location = request.get("location");
        
        interactionService.trackSearch(userId, keyword, location);
        return ResponseEntity.ok().build();
    }
}

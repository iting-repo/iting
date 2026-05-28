package com.iting.jobportal.job.controller;

import com.iting.jobportal.job.dto.SavedJobResponse;
import com.iting.jobportal.job.service.UserSavedJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "06.1 Saved Jobs", description = "APIs for candidate to save/unsave jobs")
@RestController
@RequestMapping("/api/candidates/saved-jobs")
@RequiredArgsConstructor
public class UserSavedJobController {

  private final UserSavedJobService userSavedJobService;
  private final com.iting.jobportal.recommendation.service.InteractionService interactionService;

  @GetMapping
  @Operation(summary = "Get saved jobs list (paginated)")
  public ResponseEntity<Page<SavedJobResponse>> getSavedJobs(
      @CurrentUser Long userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    PageRequest pageable = PageRequest.of(page, size, Sort.by("jobId").descending());
    return ResponseEntity.ok(userSavedJobService.getSavedJobs(userId, pageable));
  }

  @PostMapping("/{jobId}")
  @Operation(summary = "Save a job")
  public ResponseEntity<?> saveJob(@CurrentUser Long userId, @PathVariable Long jobId) {
    userSavedJobService.saveJob(userId, jobId);
    if (userId != null) {
      interactionService.trackInteraction(
          userId, jobId, com.iting.jobportal.recommendation.entity.enums.InteractionType.SAVE);
    }
    return ResponseEntity.ok(Map.of("message", "Job saved successfully"));
  }

  @DeleteMapping("/{jobId}")
  @Operation(summary = "Unsave a job")
  public ResponseEntity<?> unsaveJob(@CurrentUser Long userId, @PathVariable Long jobId) {
    userSavedJobService.unsaveJob(userId, jobId);
    return ResponseEntity.ok(Map.of("message", "Job unsaved successfully"));
  }

  @GetMapping("/{jobId}/check")
  @Operation(summary = "Check if job is saved")
  public ResponseEntity<Map<String, Boolean>> checkSaved(
      @CurrentUser Long userId, @PathVariable Long jobId) {
    return ResponseEntity.ok(Map.of("saved", userSavedJobService.isSaved(userId, jobId)));
  }

  @GetMapping("/count")
  @Operation(summary = "Get saved jobs count")
  public ResponseEntity<Map<String, Long>> countSavedJobs(@CurrentUser Long userId) {
    return ResponseEntity.ok(Map.of("count", userSavedJobService.countSavedJobs(userId)));
  }

  @GetMapping("/ids")
  @Operation(summary = "Get all saved job IDs")
  public ResponseEntity<java.util.List<Long>> getSavedJobIds(@CurrentUser Long userId) {
    return ResponseEntity.ok(userSavedJobService.getSavedJobIds(userId));
  }
}

package com.iting.jobportal.recommendation.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.recommendation.dto.response.SearchHistoryResponse;
import com.iting.jobportal.recommendation.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/search-history")
@RequiredArgsConstructor
@Tag(
    name = "06. Search History",
    description = "Lịch sử tìm kiếm của người dùng (lưu khi gọi /api/jobs/search có keyword)")
public class SearchHistoryController {

  private final InteractionService interactionService;

  @GetMapping
  @Operation(summary = "Lấy lịch sử tìm kiếm gần đây của bản thân")
  public ResponseEntity<List<SearchHistoryResponse>> getMyHistory(
      @CurrentUser Long userId, @RequestParam(defaultValue = "10") int limit) {
    if (userId == null) {
      return ResponseEntity.ok(List.of());
    }
    return ResponseEntity.ok(interactionService.getSearchHistory(userId, limit));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Xoá một mục trong lịch sử tìm kiếm")
  public ResponseEntity<Map<String, String>> deleteOne(
      @CurrentUser Long userId, @PathVariable Long id) {
    interactionService.deleteSearchHistoryItem(userId, id);
    return ResponseEntity.ok(Map.of("message", "Đã xoá"));
  }

  @DeleteMapping
  @Operation(summary = "Xoá toàn bộ lịch sử tìm kiếm")
  public ResponseEntity<Map<String, Object>> clearAll(@CurrentUser Long userId) {
    int deleted = interactionService.clearSearchHistory(userId);
    return ResponseEntity.ok(Map.of("message", "Đã xoá", "deleted", deleted));
  }
}

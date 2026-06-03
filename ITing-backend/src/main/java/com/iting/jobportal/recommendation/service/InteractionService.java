package com.iting.jobportal.recommendation.service;

import com.iting.jobportal.recommendation.dto.response.SearchHistoryResponse;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import java.util.List;

public interface InteractionService {
  void trackInteraction(Long userId, Long jobId, InteractionType type);

  void trackSearch(Long userId, String keyword, String location);

  boolean hasEnoughBehavior(Long userId);

  List<SearchHistoryResponse> getSearchHistory(Long userId, int limit);

  void deleteSearchHistoryItem(Long userId, Long historyId);

  int clearSearchHistory(Long userId);
}

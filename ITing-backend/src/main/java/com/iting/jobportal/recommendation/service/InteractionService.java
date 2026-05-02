package com.iting.jobportal.recommendation.service;

import com.iting.jobportal.recommendation.entity.enums.InteractionType;

public interface InteractionService {
    void trackInteraction(Long userId, Long jobId, InteractionType type);

    void trackSearch(Long userId, String keyword, String location);

    boolean hasEnoughBehavior(Long userId);
}

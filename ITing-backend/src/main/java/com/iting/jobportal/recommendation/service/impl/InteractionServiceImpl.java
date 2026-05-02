package com.iting.jobportal.recommendation.service.impl;

import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.recommendation.entity.UserJobInteraction;
import com.iting.jobportal.recommendation.entity.UserSearchHistory;
import com.iting.jobportal.recommendation.entity.enums.InteractionType;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import com.iting.jobportal.recommendation.service.InteractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionServiceImpl implements InteractionService {

    private final UserJobInteractionRepository interactionRepository;
    private final UserSearchHistoryRepository searchHistoryRepository;
    private final AccountRepository accountRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional
    public void trackInteraction(Long userId, Long jobId, InteractionType type) {
        if (userId == null)
            return;

        try {
            var account = accountRepository.findById(userId).orElse(null);
            var job = jobRepository.findById(jobId).orElse(null);

            if (account != null && job != null) {
                UserJobInteraction interaction = UserJobInteraction.builder()
                        .account(account)
                        .job(job)
                        .interactionType(type)
                        .weight(type.getWeight())
                        .build();
                interactionRepository.save(interaction);
            }
        } catch (Exception e) {
            log.error("Failed to track interaction: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void trackSearch(Long userId, String keyword, String location) {
        if (userId == null)
            return;

        try {
            var account = accountRepository.findById(userId).orElse(null);
            if (account != null) {
                UserSearchHistory search = UserSearchHistory.builder()
                        .account(account)
                        .keyword(keyword)
                        .location(location)
                        .build();
                searchHistoryRepository.save(search);
            }
        } catch (Exception e) {
            log.error("Failed to track search history: {}", e.getMessage());
        }
    }

    @Override
    public boolean hasEnoughBehavior(Long userId) {
        if (userId == null)
            return false;

        long totalViews = interactionRepository.countByAccountIdAndType(userId, InteractionType.VIEW);
        long totalApplies = interactionRepository.countByAccountIdAndType(userId, InteractionType.APPLY);
        long totalSaves = interactionRepository.countByAccountIdAndType(userId, InteractionType.SAVE);
        long totalSearches = searchHistoryRepository.countByAccountId(userId);

        return totalViews >= 5 || totalSearches >= 3 || totalApplies >= 1 || totalSaves >= 2;
    }
}

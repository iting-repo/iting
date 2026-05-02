package com.iting.jobportal.job.service;

import com.iting.jobportal.job.dto.SavedJobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserSavedJobService {
    Page<SavedJobResponse> getSavedJobs(Long userId, Pageable pageable);

    void saveJob(Long userId, Long jobId);

    void unsaveJob(Long userId, Long jobId);

    boolean isSaved(Long userId, Long jobId);

    long countSavedJobs(Long userId);

    java.util.List<Long> getSavedJobIds(Long userId);
}

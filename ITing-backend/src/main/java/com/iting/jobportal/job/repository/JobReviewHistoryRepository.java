package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.JobReviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobReviewHistoryRepository extends JpaRepository<JobReviewHistory, Long> {
    List<JobReviewHistory> findByJobIdOrderByTimestampAsc(Long jobId);
}
package com.iting.jobportal.job.repository;

import com.iting.jobportal.job.entity.JobReviewHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobReviewHistoryRepository extends JpaRepository<JobReviewHistory, Long> {
  List<JobReviewHistory> findByJobIdOrderByTimestampAsc(Long jobId);
}

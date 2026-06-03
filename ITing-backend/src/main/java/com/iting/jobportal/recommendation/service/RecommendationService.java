package com.iting.jobportal.recommendation.service;

import com.iting.jobportal.job.dto.response.JobResponse;
import java.util.List;

public interface RecommendationService {
  List<JobResponse> recommendHomepage(Long userId, int limit);

  List<JobResponse> getTrendingJobs(int limit);
}

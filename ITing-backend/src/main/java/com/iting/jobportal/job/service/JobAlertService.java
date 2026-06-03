package com.iting.jobportal.job.service;

import com.iting.jobportal.job.dto.FollowedCompanyJobResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobAlertService {
  Page<FollowedCompanyJobResponse> getJobsFromFollowedCompanies(Long userId, Pageable pageable);
}

package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import org.springframework.data.domain.Page;

public interface AdminApplicationService {
    Page<ApplicationResponse> getAllSystemApplications(int page, int size);

    void deleteApplication(Long applicationId);

    Page<ApplicationResponse> getApplicationsByJob(Long jobId, int page, int size);

    com.iting.jobportal.application.dto.response.JobApplicationStatsResponse
        getApplicationStatsByJob(Long jobId);
}

package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.request.ApplyJobRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.dto.response.ApplicationSubmitResponse;
import org.springframework.data.domain.Page;

public interface CandidateApplicationService {
    ApplicationSubmitResponse applyJob(Long userId, ApplyJobRequest request);
    void withdrawApplication(Long userId, Long applicationId);
    Page<ApplicationResponse> getMyApplications(Long userId, int page, int size);
    boolean hasApplied(Long userId, Long jobId);
}

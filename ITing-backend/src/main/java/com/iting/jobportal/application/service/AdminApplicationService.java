package com.iting.jobportal.application.service;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import org.springframework.data.domain.Page;

public interface AdminApplicationService {
    Page<ApplicationResponse> getAllSystemApplications(int page, int size);

    void deleteApplication(Long applicationId);
}

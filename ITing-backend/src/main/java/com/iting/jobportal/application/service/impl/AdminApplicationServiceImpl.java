package com.iting.jobportal.application.service.impl;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.repository.ApplyFormRepository;
import com.iting.jobportal.application.repository.AdminApplicationRepository;
import com.iting.jobportal.application.service.AdminApplicationService;
import com.iting.jobportal.application.util.ApplicationMapperUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminApplicationServiceImpl implements AdminApplicationService {

    private final AdminApplicationRepository adminApplicationRepository;
    private final ApplyFormRepository applyFormRepository;
    private final ApplicationMapperUtil applicationMapperUtil;

    @Override
    public Page<ApplicationResponse> getAllSystemApplications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timeSent").descending());
        return adminApplicationRepository.findAll(pageable)
                .map(sent -> {
                    ApplyForm form = applyFormRepository.findById(sent.getId().getApplyFormId())
                            .orElseThrow(() -> new RuntimeException("ApplyForm not found"));
                    return applicationMapperUtil.buildFullResponse(form, sent);
                });
    }

    @Override
    public void deleteApplication(Long applicationId) {
        adminApplicationRepository.deleteById(
                new com.iting.jobportal.application.entity.ApplyFormSentToJob.ApplyFormSentToJobId(0L, applicationId));
        applyFormRepository.deleteById(applicationId);
    }
}

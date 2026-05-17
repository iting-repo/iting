package com.iting.jobportal.common.service.impl;

import com.iting.jobportal.common.service.GeminiService;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.entity.Job;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class GeminiServiceImpl implements GeminiService {

    @Override
    public JobSearchRequest extractSearchCriteriaFromCv(String cvText) {
        log.warn("GeminiService.extractSearchCriteriaFromCv: AI chưa được kích hoạt, trả về rỗng");
        return new JobSearchRequest();
    }

    @Override
    public List<String> expandSearchTerms(String keyword) {
        log.warn("GeminiService.expandSearchTerms: AI chưa được kích hoạt, trả về rỗng");
        return Collections.emptyList();
    }

    @Override
    public String reviewJob(Job job) {
        log.warn("GeminiService.reviewJob: AI chưa được kích hoạt, mặc định APPROVE job id={}", job.getId());
        return "FINAL_DECISION: [APPROVE] - AI chưa được kích hoạt, mặc định duyệt.";
    }
}

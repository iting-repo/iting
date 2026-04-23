package com.iting.jobportal.common.service;

import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import java.util.List;

public interface GeminiService {
    String generateContent(String prompt);
    String reviewJob(Job job);
    List<String> expandSearchTerms(String keyword);
    JobSearchRequest extractSearchCriteriaFromCv(String cvText);
}

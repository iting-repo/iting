package com.iting.jobportal.common.service;

public interface GeminiService {
    String generateContent(String prompt);
    String reviewJob(com.iting.jobportal.job.entity.Job job);
}

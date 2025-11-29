package com.iting.jobportal.job.service;

import com.iting.jobportal.job.dto.CreateJobRequest;

public interface JobService {

    Long createJob(Long employerId, CreateJobRequest request);
}

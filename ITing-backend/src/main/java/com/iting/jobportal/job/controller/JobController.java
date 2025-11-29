package com.iting.jobportal.job.controller;

import com.iting.jobportal.job.dto.CreateJobRequest;
import com.iting.jobportal.job.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    public Long createJob(
            @CurrentUser Long employerId,
            @RequestBody CreateJobRequest request) {

        return jobService.createJob(employerId, request);
    }
}

package com.iting.jobportal.job.controller;

import com.iting.jobportal.job.controller.CurrentUser;
import com.iting.jobportal.job.dto.FollowedCompanyJobResponse;
import com.iting.jobportal.job.service.JobAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "06.2 Job Alerts", description = "APIs for job alerts from followed companies")
@RestController
@RequestMapping("/api/candidates/job-alerts")
@RequiredArgsConstructor
public class JobAlertController {

    private final JobAlertService jobAlertService;

    @GetMapping
    @Operation(summary = "Get jobs from followed companies (paginated)")
    public ResponseEntity<Page<FollowedCompanyJobResponse>> getJobAlerts(
            @CurrentUser Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(jobAlertService.getJobsFromFollowedCompanies(userId, pageable));
    }
}

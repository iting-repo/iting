package com.iting.jobportal.job.controller;

import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "03. Jobs - User", description = "APIs xem và tìm kiếm việc làm cho người dùng")
public class UserJobController {

    private final JobService jobService;

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm và lọc việc làm")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String techRequired,
            @RequestParam(required = false, defaultValue = "lastUpdate") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        JobSearchRequest request = new JobSearchRequest();
        request.setKeyword(keyword);
        request.setLocation(location);

        if (jobType != null) {
            request.setJobType(JobType.valueOf(jobType));
        }
        if (experienceLevel != null) {
            request.setExperienceLevel(ExperienceLevel.valueOf(experienceLevel));
        }

        request.setMinSalary(minSalary);
        request.setMaxSalary(maxSalary);
        request.setCompanyId(companyId);
        request.setTechRequired(techRequired);
        request.setSortBy(sortBy);
        request.setSortOrder(sortOrder);
        request.setPage(page);
        request.setSize(size);

        return ResponseEntity.ok(jobService.searchJobs(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết việc làm")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobByIdWithView(id));
    }

    @GetMapping("/latest")
    @Operation(summary = "Lấy danh sách việc làm mới nhất")
    public ResponseEntity<List<JobResponse>> getLatestJobs(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobService.getLatestJobs(limit));
    }

    @GetMapping("/hot")
    @Operation(summary = "Lấy danh sách việc làm hot")
    public ResponseEntity<List<JobResponse>> getHotJobs(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobService.getHotJobs(limit));
    }
}
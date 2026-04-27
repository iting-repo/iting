package com.iting.jobportal.job.controller;

import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.dto.response.SalaryReportResponse;
import com.iting.jobportal.job.entity.enums.ExperienceLevel;
import com.iting.jobportal.job.entity.enums.JobType;
import com.iting.jobportal.job.service.JobService;
import com.iting.jobportal.recommendation.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "03. Jobs - User", description = "APIs xem và tìm kiếm việc làm cho người dùng")
public class UserJobController {

    private final JobService jobService;
    private final InteractionService interactionService;

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm và lọc việc làm")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @CurrentUser Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String jobTypes,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String experienceLevels,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false) Integer postedWithinHours,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String subDomains,
            @RequestParam(required = false) String techs,
            @RequestParam(required = false) String techRequired,
            @RequestParam(required = false, defaultValue = "lastUpdate") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(required = false, defaultValue = "false") Boolean isAiSearch,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        JobSearchRequest request = new JobSearchRequest();
        request.setKeyword(keyword);
        request.setLocation(location);
        request.setIsAiSearch(isAiSearch);
        request.setSortOrder(sortOrder);

        if (jobType != null) {
            request.setJobType(JobType.valueOf(jobType));
        }
        if (jobTypes != null && !jobTypes.isBlank()) {
            request.setJobTypes(parseJobTypes(jobTypes));
        }
        if (experienceLevel != null) {
            request.setExperienceLevel(ExperienceLevel.valueOf(experienceLevel));
        }
        if (experienceLevels != null && !experienceLevels.isBlank()) {
            request.setExperienceLevels(parseExperienceLevels(experienceLevels));
        }

        request.setMinSalary(minSalary);
        request.setMaxSalary(maxSalary);
        request.setPostedWithinHours(postedWithinHours);
        request.setCompanyId(companyId);
        request.setDomain(domain);
        request.setSubDomains(parseCsv(subDomains));
        request.setTechs(parseCsv(techs));
        request.setTechRequired(techRequired);
        request.setSortBy(sortBy);
        request.setSortOrder(sortOrder);
        request.setPage(page);
        request.setSize(size);

        if (userId != null && (keyword != null || location != null)) {
            interactionService.trackSearch(userId, keyword, location);
        }

        return ResponseEntity.ok(jobService.searchJobs(request, userId));
    }

    private List<JobType> parseJobTypes(String rawValues) {
        return Arrays.stream(rawValues.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> JobType.valueOf(value.toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());
    }

    private java.util.List<String> parseCsv(String rawValues) {
        if (rawValues == null || rawValues.isBlank()) return null;
        return Arrays.stream(rawValues.split(","))
                .map(String::trim)
                .filter(v -> !v.isEmpty())
                .collect(Collectors.toList());
    }

    private List<ExperienceLevel> parseExperienceLevels(String rawValues) {
        return Arrays.stream(rawValues.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> ExperienceLevel.valueOf(value.toUpperCase(Locale.ROOT)))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết việc làm")
    public ResponseEntity<JobResponse> getJob(@CurrentUser Long userId, @PathVariable Long id) {
        if (userId != null) {
            interactionService.trackInteraction(userId, id, com.iting.jobportal.recommendation.entity.enums.InteractionType.VIEW);
        }
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

    @GetMapping("/salary-report")
    @Operation(summary = "Lấy báo cáo lương")
    public ResponseEntity<SalaryReportResponse> getSalaryReport(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String experience
    ) {
        return ResponseEntity.ok(jobService.getSalaryReport(keyword, location, experience));
    }

    @PostMapping("/analyze-cv")
    public com.iting.jobportal.job.dto.request.JobSearchRequest analyzeCv(@RequestBody String cvText) {
        return jobService.analyzeCvForSearch(cvText);
    }
}

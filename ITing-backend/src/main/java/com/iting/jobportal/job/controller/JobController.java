package com.iting.jobportal.job.controller;

import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.JobSearchRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "APIs quản lý việc làm")
public class JobController {

    private final JobService jobService;

    // ========== PUBLIC APIs (Cho ứng viên) ==========

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
            request.setJobType(com.iting.jobportal.job.entity.enums.JobType.valueOf(jobType));
        }
        if (experienceLevel != null) {
            request.setExperienceLevel(com.iting.jobportal.job.entity.enums.ExperienceLevel.valueOf(experienceLevel));
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

    // ========== EMPLOYER APIs (RBAC Applied) ==========

    @PostMapping
    @Operation(summary = "Đăng tin tuyển dụng mới")
    public ResponseEntity<JobResponse> createJob(
            @CurrentUser Long currentEmployerId,
            @Valid @RequestBody CreateJobRequest request) {
        if (currentEmployerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để đăng tin tuyển dụng");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(currentEmployerId, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật tin tuyển dụng")
    public ResponseEntity<JobResponse> updateJob(
            @CurrentUser Long employerId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobRequest request) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để cập nhật tin tuyển dụng");
        }
        return ResponseEntity.ok(jobService.updateJob(employerId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tin tuyển dụng")
    public ResponseEntity<?> deleteJob(
            @CurrentUser Long employerId,
            @PathVariable Long id) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để xóa tin tuyển dụng");
        }
        jobService.deleteJob(employerId, id);
        return ResponseEntity.ok(Map.of("message", "Xóa tin tuyển dụng thành công"));
    }

    @PostMapping("/{id}/extend")
    @Operation(summary = "Gia hạn tin tuyển dụng")
    public ResponseEntity<JobResponse> extendJob(
            @CurrentUser Long employerId,
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") int days) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để gia hạn tin tuyển dụng");
        }
        return ResponseEntity.ok(jobService.extendJob(employerId, id, days));
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "Đóng tin tuyển dụng")
    public ResponseEntity<JobResponse> closeJob(
            @CurrentUser Long employerId,
            @PathVariable Long id) {
        if (employerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để đóng tin tuyển dụng");
        }
        return ResponseEntity.ok(jobService.closeJob(employerId, id));
    }

    @GetMapping("/my-jobs")
    @Operation(summary = "Lấy danh sách tin tuyển dụng của tôi (Employer)")
    public ResponseEntity<Page<JobResponse>> getMyJobs(
            @CurrentUser Long currentEmployerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (currentEmployerId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để xem danh sách tin tuyển dụng");
        }
        return ResponseEntity.ok(jobService.getJobsByEmployer(currentEmployerId, page, size));
    }
}

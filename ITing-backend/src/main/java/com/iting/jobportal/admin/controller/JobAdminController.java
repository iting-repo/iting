package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.ReviewRejectRequest;
import com.iting.jobportal.admin.service.AdminCompanyService;
import com.iting.jobportal.admin.service.AdminJobService;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.enums.JobStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@Tag(name = "Admin Job Management", description = "Admin quản lý việc làm")
public class JobAdminController {

    private final AdminJobService adminJobService;

    /*
    ============================
    LẤY DANH SÁCH JOB
    ============================
    */

    @GetMapping
    @Operation(summary = "Lấy danh sách job")
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(adminJobService.getAllJobs(page, size));
    }

    /*
    ============================
    FILTER JOB
    ============================
    */

    @GetMapping("/filter")
    @Operation(summary = "Filter job")
    public ResponseEntity<Page<JobResponse>> filterJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                adminJobService.filterJobs(status, companyId, keyword, location, page, size)
        );
    }

    /*
    ============================
    JOB DETAIL
    ============================
    */

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết job")
    public ResponseEntity<JobResponse> getJobDetail(@PathVariable Long id) {

        return ResponseEntity.ok(adminJobService.getJobById(id));
    }

    /*
    ============================
    APPROVE JOB
    ============================
    */

    @PostMapping("/{id}/approve")
    @Operation(summary = "Duyệt job")
    public ResponseEntity<?> approveJob(@PathVariable Long id) {

        Long adminId = 1L;

        adminJobService.approveJob(adminId, id);

        return ResponseEntity.ok(
                Map.of("message", "Job approved successfully")
        );
    }

    /*
    ============================
    REJECT JOB
    ============================
    */

    @PostMapping("/{id}/reject")
    @Operation(summary = "Từ chối job")
    public ResponseEntity<?> rejectJob(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {

        Long adminId = 1L;

        adminJobService.rejectJob(adminId, id, request.getReason());

        return ResponseEntity.ok(
                Map.of("message", "Job rejected successfully")
        );
    }

    /*
    ============================
    REQUEST REVISION
    ============================
    */

    @PostMapping("/{id}/request-revision")
    @Operation(summary = "Yêu cầu chỉnh sửa job")
    public ResponseEntity<?> requestRevision(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {

        Long adminId = 1L;

        adminJobService.requestJobRevision(adminId, id, request.getReason());

        return ResponseEntity.ok(
                Map.of("message", "Revision requested successfully")
        );
    }

    /*
    ============================
    SUSPEND JOB
    ============================
    */

    @PostMapping("/{id}/suspend")
    @Operation(summary = "Đình chỉ job")
    public ResponseEntity<?> suspendJob(
            @PathVariable Long id,
            @RequestBody ReviewRejectRequest request) {

        Long adminId = 1L;

        adminJobService.suspendJob(adminId, id, request.getReason());

        return ResponseEntity.ok(
                Map.of("message", "Job suspended successfully")
        );
    }

    /*
    ============================
    UNSUSPEND JOB
    ============================
    */

    @PostMapping("/{id}/unsuspend")
    @Operation(summary = "Bỏ đình chỉ job")
    public ResponseEntity<?> unsuspendJob(@PathVariable Long id) {

        Long adminId = 1L;

        adminJobService.unsuspendJob(adminId, id);

        return ResponseEntity.ok(
                Map.of("message", "Job unsuspended successfully")
        );
    }

    /*
    ============================
    CLOSE JOB
    ============================
    */

    @PostMapping("/{id}/close")
    @Operation(summary = "Đóng job")
    public ResponseEntity<?> closeJob(@PathVariable Long id) {

        Long adminId = 1L;

        adminJobService.closeJobByAdmin(adminId, id);

        return ResponseEntity.ok(
                Map.of("message", "Job closed successfully")
        );
    }


    /*
    ============================
    UNFEATURE JOB
    ============================
    */


    @PostMapping("/{id}/unfeature")
    public ResponseEntity<?> unfeatureJob(@PathVariable Long id){

        adminJobService.unfeatureJob(id);

        return ResponseEntity.ok(
                Map.of("message","Job unfeatured successfully")
        );
    }
}
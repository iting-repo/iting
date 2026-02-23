package com.iting.jobportal.job.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@Tag(name = "Admin Jobs", description = "APIs quản lý việc làm cho Admin")
public class JobAdminController {

    // Admin-only job management endpoints
    
    @PostMapping("/{id}/feature")
    @PreAuthorize("hasAuthority('JOB_MANAGE')")
    @Operation(summary = "Đánh dấu việc làm là nổi bật (Admin only)")
    public ResponseEntity<?> featureJob(@PathVariable Long id) {
        // Implementation would go here
        return ResponseEntity.ok(Map.of("message", "Job featured successfully"));
    }
    
    @PostMapping("/{id}/unfeature")
    @PreAuthorize("hasAuthority('JOB_MANAGE')")
    @Operation(summary = "Bỏ đánh dấu nổi bật (Admin only)")
    public ResponseEntity<?> unfeatureJob(@PathVariable Long id) {
        // Implementation would go here
        return ResponseEntity.ok(Map.of("message", "Job unfeatured successfully"));
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('JOB_MANAGE')")
    @Operation(summary = "Phê duyệt việc làm (Admin only)")
    public ResponseEntity<?> approveJob(@PathVariable Long id) {
        // Implementation would go here
        return ResponseEntity.ok(Map.of("message", "Job approved successfully"));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('JOB_MANAGE')")
    @Operation(summary = "Từ chối việc làm (Admin only)")
    public ResponseEntity<?> rejectJob(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        // Implementation would go here
        return ResponseEntity.ok(Map.of("message", "Job rejected successfully"));
    }
    
    @PostMapping("/{id}/ban-employer")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    @Operation(summary = "Cấm nhà tuyển dụng (Admin only)")
    public ResponseEntity<?> banEmployer(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        // Implementation would go here
        return ResponseEntity.ok(Map.of("message", "Employer banned successfully"));
    }
}

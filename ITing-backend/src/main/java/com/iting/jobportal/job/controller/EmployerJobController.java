package com.iting.jobportal.job.controller;

import com.iting.jobportal.admin.dto.request.BulkActionRequest;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * @deprecated Phase 4 dual-mount. Dùng {@link HrJobController} ở {@code /api/hr/jobs/**}. Sẽ remove
 *     sau 2 sprint.
 */
@Deprecated(since = "Phase 4")
@RestController
@RequestMapping("/api/employer/jobs")
@RequiredArgsConstructor
@Tag(name = "04. Jobs - Employer (DEPRECATED)", description = "DEPRECATED — dùng /api/hr/jobs/**")
public class EmployerJobController {

  private final JobService jobService;

  @PostMapping
  @Operation(summary = "Đăng tin tuyển dụng mới")
  public ResponseEntity<JobResponse> createJob(
      @CurrentUser Long employerId, @Valid @RequestBody CreateJobRequest request) {
    if (employerId == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để đăng tin tuyển dụng");
    }
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(jobService.createJob(employerId, request));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Cập nhật tin tuyển dụng")
  public ResponseEntity<JobResponse> updateJob(
      @CurrentUser Long employerId,
      @PathVariable Long id,
      @Valid @RequestBody UpdateJobRequest request) {
    if (employerId == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để cập nhật tin tuyển dụng");
    }
    return ResponseEntity.ok(jobService.updateJob(employerId, id, request));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Xóa tin tuyển dụng")
  public ResponseEntity<?> deleteJob(@CurrentUser Long employerId, @PathVariable Long id) {
    if (employerId == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để xóa tin tuyển dụng");
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
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để gia hạn tin tuyển dụng");
    }
    return ResponseEntity.ok(jobService.extendJob(employerId, id, days));
  }

  @PostMapping("/{id}/close")
  @Operation(summary = "Đóng tin tuyển dụng")
  public ResponseEntity<JobResponse> closeJob(@CurrentUser Long employerId, @PathVariable Long id) {
    if (employerId == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để đóng tin tuyển dụng");
    }
    return ResponseEntity.ok(jobService.closeJob(employerId, id));
  }

  @PostMapping("/{id}/reopen")
  @Operation(summary = "Mở lại tin tuyển dụng")
  public ResponseEntity<JobResponse> reopenJob(
      @CurrentUser Long employerId, @PathVariable Long id) {
    if (employerId == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để mở lại tin tuyển dụng");
    }
    return ResponseEntity.ok(jobService.reopenJob(employerId, id));
  }

  @GetMapping("/my-jobs")
  @Operation(summary = "Lấy danh sách tin tuyển dụng của tôi")
  public ResponseEntity<Page<JobResponse>> getMyJobs(
      @CurrentUser Long employerId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    if (employerId == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để xem danh sách tin tuyển dụng");
    }
    return ResponseEntity.ok(jobService.getJobsByEmployer(employerId, page, size));
  }

  @PostMapping("/{id}/submit-review")
  @Operation(summary = "Gửi tin tuyển dụng để duyệt")
  public ResponseEntity<JobResponse> submitJobForReview(
      @CurrentUser Long employerId, @PathVariable Long id) {
    if (employerId == null) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để gửi duyệt tin tuyển dụng");
    }
    return ResponseEntity.ok(jobService.submitJobForReview(employerId, id));
  }

  /*
   * ============================
   * BULK ACTIONS
   * ============================
   */

  @PostMapping("/bulk-delete")
  @Operation(summary = "Xóa nhiều tin tuyển dụng")
  public ResponseEntity<?> bulkDeleteJobs(
      @CurrentUser Long employerId, @RequestBody BulkActionRequest request) {
    if (employerId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
    }
    jobService.bulkDeleteJobs(employerId, request.getIds());
    return ResponseEntity.ok(Map.of("message", "Xóa nhiều tin tuyển dụng thành công"));
  }

  @PostMapping("/bulk-close")
  @Operation(summary = "Đóng nhiều tin tuyển dụng")
  public ResponseEntity<?> bulkCloseJobs(
      @CurrentUser Long employerId, @RequestBody BulkActionRequest request) {
    if (employerId == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
    }
    jobService.bulkCloseJobs(employerId, request.getIds());
    return ResponseEntity.ok(Map.of("message", "Đóng nhiều tin tuyển dụng thành công"));
  }
}

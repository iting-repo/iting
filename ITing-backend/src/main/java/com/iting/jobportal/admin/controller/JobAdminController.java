package com.iting.jobportal.admin.controller;

import com.iting.jobportal.admin.dto.request.BulkActionRequest;
import com.iting.jobportal.admin.dto.request.BulkReviewRejectRequest;
import com.iting.jobportal.admin.dto.request.ReviewRejectRequest;
import com.iting.jobportal.admin.service.AdminJobService;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.enums.JobStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@Tag(name = "13F. Admin Job Management", description = "Admin quản lý việc làm")
public class JobAdminController {

  private final AdminJobService adminJobService;

  // bổ sung review list

  /*
   * ============================
   * LẤY DANH SÁCH JOB
   * ============================
   */

  @GetMapping
  @Operation(summary = "Lấy danh sách job")
  public ResponseEntity<Page<JobResponse>> getAllJobs(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {

    return ResponseEntity.ok(adminJobService.getAllJobs(page, size));
  }

  /*
   * ============================
   * FILTER JOB
   * ============================
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
        adminJobService.filterJobs(status, companyId, keyword, location, page, size));
  }

  /*
   * ============================
   * JOB DETAIL
   * ============================
   */

  @GetMapping("/{id}")
  @Operation(summary = "Chi tiết job")
  public ResponseEntity<JobResponse> getJobDetail(@PathVariable Long id) {

    return ResponseEntity.ok(adminJobService.getJobById(id));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Xóa job (hard delete)")
  public ResponseEntity<?> deleteJob(@PathVariable Long id) {
    adminJobService.deleteJob(id);
    return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
  }

  /*
   * ============================
   * APPROVE JOB
   * ============================
   */

  @PostMapping("/{id}/approve")
  @Operation(summary = "Duyệt job")
  public ResponseEntity<?> approveJob(@PathVariable Long id) {

    Long adminId = 1L;

    adminJobService.approveJob(adminId, id);

    return ResponseEntity.ok(Map.of("message", "Job approved successfully"));
  }

  /*
   * ============================
   * REJECT JOB
   * ============================
   */

  @PostMapping("/{id}/reject")
  @Operation(summary = "Từ chối job")
  public ResponseEntity<?> rejectJob(
      @PathVariable Long id, @RequestBody ReviewRejectRequest request) {

    Long adminId = 1L;

    adminJobService.rejectJob(adminId, id, request.getReason());

    return ResponseEntity.ok(Map.of("message", "Job rejected successfully"));
  }

  /*
   * ============================
   * REQUEST REVISION
   * ============================
   */

  // @PostMapping("/{id}/request-revision")
  // @Operation(summary = "Yêu cầu chỉnh sửa job")
  // public ResponseEntity<?> requestRevision(
  // @PathVariable Long id,
  // @RequestBody ReviewRejectRequest request) {
  //
  // Long adminId = 1L;
  //
  // adminJobService.requestJobRevision(adminId, id, request.getReason());
  //
  // return ResponseEntity.ok(
  // Map.of("message", "Revision requested successfully")
  // );
  // }

  /*
   * ============================
   * SUSPEND JOB
   * ============================
   */

  @PostMapping("/{id}/suspend")
  @Operation(summary = "Đình chỉ job")
  public ResponseEntity<?> suspendJob(
      @PathVariable Long id, @RequestBody ReviewRejectRequest request) {

    Long adminId = 1L;

    adminJobService.suspendJob(adminId, id, request.getReason());

    return ResponseEntity.ok(Map.of("message", "Job suspended successfully"));
  }

  /*
   * ============================
   * UNSUSPEND JOB
   * ============================
   */

  @PostMapping("/{id}/unsuspend")
  @Operation(summary = "Bỏ đình chỉ job")
  public ResponseEntity<?> unsuspendJob(@PathVariable Long id) {

    Long adminId = 1L;

    adminJobService.unsuspendJob(adminId, id);

    return ResponseEntity.ok(Map.of("message", "Job unsuspended successfully"));
  }

  /*
   * ============================
   * CLOSE JOB
   * ============================
   */

  @PostMapping("/{id}/close")
  @Operation(summary = "Đóng job")
  public ResponseEntity<?> closeJob(@PathVariable Long id) {

    Long adminId = 1L;

    adminJobService.closeJobByAdmin(adminId, id);

    return ResponseEntity.ok(Map.of("message", "Job closed successfully"));
  }

  /*
   * ============================
   * UNFEATURE JOB
   * ============================
   */

  @PostMapping("/{id}/unfeature")
  public ResponseEntity<?> unfeatureJob(@PathVariable Long id) {

    adminJobService.unfeatureJob(id);

    return ResponseEntity.ok(Map.of("message", "Job unfeatured successfully"));
  }

  /*
   * ============================
   * BULK ACTIONS
   * ============================
   */

  @PostMapping("/bulk-approve")
  @Operation(summary = "Duyệt nhiều job")
  public ResponseEntity<?> bulkApproveJobs(@RequestBody BulkActionRequest request) {
    Long adminId = 1L;
    adminJobService.bulkApproveJobs(adminId, request.getIds());
    return ResponseEntity.ok(Map.of("message", "Jobs approved successfully"));
  }

  @PostMapping("/bulk-reject")
  @Operation(summary = "Từ chối nhiều job")
  public ResponseEntity<?> bulkRejectJobs(@RequestBody BulkReviewRejectRequest request) {
    Long adminId = 1L;
    adminJobService.bulkRejectJobs(adminId, request.getIds(), request.getReason());
    return ResponseEntity.ok(Map.of("message", "Jobs rejected successfully"));
  }

  @PostMapping("/bulk-suspend")
  @Operation(summary = "Đình chỉ nhiều job")
  public ResponseEntity<?> bulkSuspendJobs(@RequestBody BulkReviewRejectRequest request) {
    Long adminId = 1L;
    adminJobService.bulkSuspendJobs(adminId, request.getIds(), request.getReason());
    return ResponseEntity.ok(Map.of("message", "Jobs suspended successfully"));
  }

  @PostMapping("/bulk-close")
  @Operation(summary = "Đóng nhiều job")
  public ResponseEntity<?> bulkCloseJobs(@RequestBody BulkActionRequest request) {
    Long adminId = 1L;
    adminJobService.bulkCloseJobs(adminId, request.getIds());
    return ResponseEntity.ok(Map.of("message", "Jobs closed successfully"));
  }

  @PostMapping("/bulk-delete")
  @Operation(summary = "Xóa nhiều job")
  public ResponseEntity<?> bulkDeleteJobs(@RequestBody BulkActionRequest request) {
    adminJobService.bulkDeleteJobs(request.getIds());
    return ResponseEntity.ok(Map.of("message", "Jobs deleted successfully"));
  }

  @GetMapping("/export")
  @Operation(summary = "Xuất danh sách công việc ra file Excel")
  public ResponseEntity<Resource> exportJobs() {
    String filename = "jobs.xlsx";
    InputStreamResource file = new InputStreamResource(adminJobService.exportJobsToExcel());

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(file);
  }

  @PostMapping("/import")
  @Operation(summary = "Nhập danh sách công việc từ file Excel")
  public ResponseEntity<?> importJobs(@RequestParam("file") MultipartFile file) {
    adminJobService.importJobsFromExcel(file);
    return ResponseEntity.ok(Map.of("message", "Jobs imported successfully"));
  }

  @GetMapping("/template")
  @Operation(summary = "Tải file mẫu Excel để nhập công việc")
  public ResponseEntity<Resource> getTemplate() {
    String filename = "jobs_template.xlsx";
    InputStreamResource file = new InputStreamResource(adminJobService.getImportTemplate());

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .body(file);
  }

  @PostMapping("/{id}/ai-review")
  @Operation(summary = "Review job bằng AI")
  public ResponseEntity<?> aiReviewJob(@PathVariable Long id) {
    return ResponseEntity.ok(adminJobService.aiReviewJob(id));
  }
}

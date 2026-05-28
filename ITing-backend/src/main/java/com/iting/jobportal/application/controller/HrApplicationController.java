package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.request.ApplicationSearchRequest;
import com.iting.jobportal.application.dto.request.ApplicationStats;
import com.iting.jobportal.application.dto.request.UpdateApplicationStatusRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.application.service.EmployerApplicationService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * HR-side application management. Cùng logic với {@link EmployerApplicationController}, chỉ khác
 * base path. Phase 4 dual-mount.
 */
@Tag(name = "08.2 Application HR", description = "APIs HR quản lý ứng viên (path mới)")
@RestController
@RequestMapping("/api/hr/applications")
@RequiredArgsConstructor
public class HrApplicationController {

  private final EmployerApplicationService employerApplicationService;

  @GetMapping("/job/{jobId}")
  @Operation(summary = "Danh sách đơn ứng tuyển của một job")
  public ResponseEntity<Page<ApplicationResponse>> getApplicationsByJob(
      @CurrentUser Long employerId,
      @PathVariable Long jobId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(
        employerApplicationService.getApplicationsByJob(employerId, jobId, page, size));
  }

  @GetMapping
  @Operation(summary = "Tất cả đơn ứng tuyển của HR")
  public ResponseEntity<Page<ApplicationResponse>> getAllApplications(
      @CurrentUser Long employerId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(
        employerApplicationService.getAllApplicationsForEmployer(employerId, page, size));
  }

  @GetMapping("/search")
  @Operation(summary = "Tìm kiếm và lọc đơn ứng tuyển")
  public ResponseEntity<Page<ApplicationResponse>> searchApplications(
      @CurrentUser Long employerId,
      @RequestParam(required = false) Long jobId,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "timeSent") String sortBy,
      @RequestParam(defaultValue = "desc") String sortOrder,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    ApplicationSearchRequest request = new ApplicationSearchRequest();
    request.setJobId(jobId);
    if (status != null) request.setStatus(ApplicationStatus.valueOf(status));
    request.setKeyword(keyword);
    request.setSortBy(sortBy);
    request.setSortOrder(sortOrder);
    request.setPage(page);
    request.setSize(size);

    return ResponseEntity.ok(employerApplicationService.searchApplications(employerId, request));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Xem chi tiết đơn ứng tuyển")
  public ResponseEntity<ApplicationResponse> getApplication(
      @CurrentUser Long employerId, @PathVariable Long id) {
    return ResponseEntity.ok(employerApplicationService.viewApplication(employerId, id));
  }

  @PostMapping("/{id}/view")
  @Operation(summary = "Đánh dấu đã xem hồ sơ (Trigger viewed status & notification)")
  public ResponseEntity<ApplicationResponse> markAsViewed(
      @CurrentUser Long employerId, @PathVariable Long id) {
    return ResponseEntity.ok(employerApplicationService.markApplicationAsViewed(employerId, id));
  }

  @PutMapping("/{id}/status")
  @Operation(summary = "Cập nhật trạng thái đơn")
  public ResponseEntity<ApplicationResponse> updateStatus(
      @CurrentUser Long employerId,
      @PathVariable Long id,
      @Valid @RequestBody UpdateApplicationStatusRequest request) {
    return ResponseEntity.ok(
        employerApplicationService.updateApplicationStatus(employerId, id, request));
  }

  @PostMapping("/{id}/accept")
  @Operation(summary = "Chấp nhận ứng viên (Update status)")
  public ResponseEntity<ApplicationResponse> acceptApplication(
      @CurrentUser Long employerId,
      @PathVariable Long id,
      @RequestParam(required = false) String note) {
    return ResponseEntity.ok(employerApplicationService.acceptApplication(employerId, id, note));
  }

  @PostMapping("/{id}/reject")
  @Operation(summary = "Từ chối ứng viên (Update status)")
  public ResponseEntity<ApplicationResponse> rejectApplication(
      @CurrentUser Long employerId,
      @PathVariable Long id,
      @RequestParam(required = false) String note) {
    return ResponseEntity.ok(employerApplicationService.rejectApplication(employerId, id, note));
  }

  @GetMapping("/stats")
  @Operation(summary = "Thống kê tổng quan cho HR")
  public ResponseEntity<ApplicationStats> getEmployerStats(@CurrentUser Long employerId) {
    return ResponseEntity.ok(employerApplicationService.getStatsForEmployer(employerId));
  }

  @PostMapping("/search/cv-upload")
  @Operation(summary = "OCR Scanner: Tìm kiếm ứng viên bằng CV template")
  public ResponseEntity<List<ApplicationResponse>> searchByCv(
      @CurrentUser Long employerId, @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(employerApplicationService.searchCandidatesByCvFile(employerId, file));
  }

  @GetMapping("/search/cv-keyword")
  @Operation(summary = "Full-Text Search: Tìm ứng viên theo keyword trong nội dung CV")
  public ResponseEntity<List<ApplicationResponse>> searchByKeyword(
      @CurrentUser Long employerId, @RequestParam("keyword") String keyword) {
    return ResponseEntity.ok(
        employerApplicationService.searchCandidatesByCvKeyword(employerId, keyword));
  }

  @GetMapping("/job/{jobId}/ranked")
  @Operation(
      summary = "🤖 AI Ranking: Xếp hạng ứng viên theo điểm phù hợp CV ↔ JD",
      description = "Trả về danh sách ứng viên đã apply, sắp xếp theo AI match score giảm dần")
  public ResponseEntity<Page<ApplicationResponse>> getApplicationsRankedByMatch(
      @CurrentUser Long employerId,
      @PathVariable Long jobId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(
        employerApplicationService.getApplicationsRankedByMatch(employerId, jobId, page, size));
  }
}

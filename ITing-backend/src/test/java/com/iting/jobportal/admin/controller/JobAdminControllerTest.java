package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.request.BulkActionRequest;
import com.iting.jobportal.admin.dto.request.BulkReviewRejectRequest;
import com.iting.jobportal.admin.dto.request.ReviewRejectRequest;
import com.iting.jobportal.admin.service.AdminJobService;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.enums.JobStatus;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class JobAdminControllerTest {

  @Mock private AdminJobService adminJobService;
  @InjectMocks private JobAdminController controller;

  // ── list + filter + detail ──────────────────────────────────────────

  @Test
  void getAllJobs_paginatedFromService() {
    Page<JobResponse> page = new PageImpl<>(List.of());
    when(adminJobService.getAllJobs(0, 10)).thenReturn(page);

    ResponseEntity<Page<JobResponse>> resp = controller.getAllJobs(0, 10);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(page, resp.getBody());
  }

  @Test
  void filterJobs_passesAllFilters() {
    Page<JobResponse> page = new PageImpl<>(List.of());
    when(adminJobService.filterJobs(JobStatus.ACTIVE, 5L, "java", "HCM", 0, 10)).thenReturn(page);

    assertSame(page, controller.filterJobs(JobStatus.ACTIVE, 5L, "java", "HCM", 0, 10).getBody());
  }

  @Test
  void filterJobs_nullableFilters_allowed() {
    when(adminJobService.filterJobs(null, null, null, null, 0, 10))
        .thenReturn(new PageImpl<>(List.of()));

    controller.filterJobs(null, null, null, null, 0, 10);

    verify(adminJobService).filterJobs(null, null, null, null, 0, 10);
  }

  @Test
  void getJobDetail_delegatesToService() {
    JobResponse expected = JobResponse.builder().build();
    when(adminJobService.getJobById(5L)).thenReturn(expected);

    assertSame(expected, controller.getJobDetail(5L).getBody());
  }

  // ── single actions ──────────────────────────────────────────────────

  @Test
  void deleteJob_callsService() {
    ResponseEntity<?> resp = controller.deleteJob(5L);

    verify(adminJobService).deleteJob(5L);
    assertEquals("Job deleted successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void approveJob_passesAdminId() {
    ResponseEntity<?> resp = controller.approveJob(5L);

    verify(adminJobService).approveJob(1L, 5L);
    assertEquals("Job approved successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void rejectJob_passesReason() {
    ReviewRejectRequest req = new ReviewRejectRequest();
    req.setReason("Nội dung không hợp lệ");

    ResponseEntity<?> resp = controller.rejectJob(5L, req);

    verify(adminJobService).rejectJob(1L, 5L, "Nội dung không hợp lệ");
    assertEquals("Job rejected successfully", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void suspendJob_passesReason() {
    ReviewRejectRequest req = new ReviewRejectRequest();
    req.setReason("Vi phạm chính sách");

    controller.suspendJob(5L, req);

    verify(adminJobService).suspendJob(1L, 5L, "Vi phạm chính sách");
  }

  @Test
  void unsuspendJob_callsService() {
    controller.unsuspendJob(5L);
    verify(adminJobService).unsuspendJob(1L, 5L);
  }

  @Test
  void closeJob_callsService() {
    controller.closeJob(5L);
    verify(adminJobService).closeJobByAdmin(1L, 5L);
  }

  @Test
  void unfeatureJob_callsService() {
    controller.unfeatureJob(5L);
    verify(adminJobService).unfeatureJob(5L);
  }

  // ── bulk operations ─────────────────────────────────────────────────

  @Test
  void bulkApproveJobs_passesIds() {
    BulkActionRequest req = new BulkActionRequest();
    req.setIds(List.of(1L, 2L, 3L));

    controller.bulkApproveJobs(req);

    verify(adminJobService).bulkApproveJobs(1L, List.of(1L, 2L, 3L));
  }

  @Test
  void bulkRejectJobs_passesIdsAndReason() {
    BulkReviewRejectRequest req = new BulkReviewRejectRequest();
    req.setIds(List.of(1L, 2L));
    req.setReason("Spam");

    controller.bulkRejectJobs(req);

    verify(adminJobService).bulkRejectJobs(1L, List.of(1L, 2L), "Spam");
  }

  @Test
  void bulkSuspendJobs_passesIdsAndReason() {
    BulkReviewRejectRequest req = new BulkReviewRejectRequest();
    req.setIds(List.of(7L));
    req.setReason("Audit");

    controller.bulkSuspendJobs(req);

    verify(adminJobService).bulkSuspendJobs(1L, List.of(7L), "Audit");
  }

  @Test
  void bulkCloseJobs_passesIds() {
    BulkActionRequest req = new BulkActionRequest();
    req.setIds(List.of(1L, 2L));

    controller.bulkCloseJobs(req);

    verify(adminJobService).bulkCloseJobs(1L, List.of(1L, 2L));
  }

  @Test
  void bulkDeleteJobs_passesIds_noAdminId() {
    // Note: bulkDelete does NOT take adminId in service signature
    BulkActionRequest req = new BulkActionRequest();
    req.setIds(List.of(1L, 2L));

    controller.bulkDeleteJobs(req);

    verify(adminJobService).bulkDeleteJobs(List.of(1L, 2L));
  }

  // ── export / import ─────────────────────────────────────────────────

  @Test
  void exportJobs_returnsExcelStream() {
    when(adminJobService.exportJobsToExcel())
        .thenReturn(new ByteArrayInputStream(new byte[] {1, 2, 3}));

    ResponseEntity<Resource> resp = controller.exportJobs();

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals(
        MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        resp.getHeaders().getContentType());
    assertTrue(resp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).contains("jobs.xlsx"));
  }

  @Test
  void importJobs_passesFile() {
    MockMultipartFile file = new MockMultipartFile("file", "jobs.xlsx", null, new byte[1024]);

    controller.importJobs(file);

    verify(adminJobService).importJobsFromExcel(any(MultipartFile.class));
  }
}

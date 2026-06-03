package com.iting.jobportal.job.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.request.BulkActionRequest;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.service.JobService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class HrJobControllerTest {

  @Mock private JobService jobService;
  @InjectMocks private HrJobController controller;

  // ── createJob ────────────────────────────────────────────────────────

  @Test
  void createJob_authenticated_returns201() {
    CreateJobRequest req = new CreateJobRequest();
    JobResponse created = JobResponse.builder().build();
    when(jobService.createJob(99L, req)).thenReturn(created);

    ResponseEntity<JobResponse> resp = controller.createJob(99L, req);

    assertEquals(HttpStatus.CREATED, resp.getStatusCode());
    assertSame(created, resp.getBody());
  }

  @Test
  void createJob_unauth_throws401() {
    ResponseStatusException ex =
        assertThrows(
            ResponseStatusException.class,
            () -> controller.createJob(null, new CreateJobRequest()));
    assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    verify(jobService, never())
        .createJob(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
  }

  // ── updateJob ────────────────────────────────────────────────────────

  @Test
  void updateJob_authenticated_delegatesToService() {
    UpdateJobRequest req = new UpdateJobRequest();
    JobResponse updated = JobResponse.builder().build();
    when(jobService.updateJob(99L, 5L, req)).thenReturn(updated);

    assertSame(updated, controller.updateJob(99L, 5L, req).getBody());
  }

  @Test
  void updateJob_unauth_throws401() {
    assertThrows(
        ResponseStatusException.class,
        () -> controller.updateJob(null, 5L, new UpdateJobRequest()));
  }

  // ── deleteJob ────────────────────────────────────────────────────────

  @Test
  void deleteJob_authenticated_returnsMessage() {
    ResponseEntity<?> resp = controller.deleteJob(99L, 5L);

    verify(jobService).deleteJob(99L, 5L);
    assertEquals("Xóa tin tuyển dụng thành công", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void deleteJob_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.deleteJob(null, 5L));
  }

  // ── extendJob / closeJob / reopenJob ────────────────────────────────

  @Test
  void extendJob_defaultDays30() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.extendJob(99L, 5L, 30)).thenReturn(expected);

    assertSame(expected, controller.extendJob(99L, 5L, 30).getBody());
  }

  @Test
  void extendJob_customDays_passedThrough() {
    when(jobService.extendJob(99L, 5L, 60)).thenReturn(JobResponse.builder().build());

    controller.extendJob(99L, 5L, 60);

    verify(jobService).extendJob(99L, 5L, 60);
  }

  @Test
  void extendJob_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.extendJob(null, 5L, 30));
  }

  @Test
  void closeJob_delegatesToService() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.closeJob(99L, 5L)).thenReturn(expected);

    assertSame(expected, controller.closeJob(99L, 5L).getBody());
  }

  @Test
  void closeJob_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.closeJob(null, 5L));
  }

  @Test
  void reopenJob_delegatesToService() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.reopenJob(99L, 5L)).thenReturn(expected);

    assertSame(expected, controller.reopenJob(99L, 5L).getBody());
  }

  @Test
  void reopenJob_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.reopenJob(null, 5L));
  }

  // ── getMyJobs / submitJobForReview ──────────────────────────────────

  @Test
  void getMyJobs_paginated() {
    Page<JobResponse> page = new PageImpl<>(List.of());
    when(jobService.getJobsByEmployer(99L, 0, 10)).thenReturn(page);

    assertSame(page, controller.getMyJobs(99L, 0, 10).getBody());
  }

  @Test
  void getMyJobs_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.getMyJobs(null, 0, 10));
  }

  @Test
  void submitJobForReview_delegatesToService() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.submitJobForReview(99L, 5L)).thenReturn(expected);

    assertSame(expected, controller.submitJobForReview(99L, 5L).getBody());
  }

  @Test
  void submitJobForReview_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.submitJobForReview(null, 5L));
  }

  // ── bulk operations ─────────────────────────────────────────────────

  @Test
  void bulkDeleteJobs_passesIds() {
    BulkActionRequest req = new BulkActionRequest();
    req.setIds(List.of(1L, 2L, 3L));

    controller.bulkDeleteJobs(99L, req);

    verify(jobService).bulkDeleteJobs(99L, List.of(1L, 2L, 3L));
  }

  @Test
  void bulkDeleteJobs_unauth_throws401() {
    assertThrows(
        ResponseStatusException.class,
        () -> controller.bulkDeleteJobs(null, new BulkActionRequest()));
  }

  @Test
  void bulkCloseJobs_passesIds() {
    BulkActionRequest req = new BulkActionRequest();
    req.setIds(List.of(1L, 2L));

    controller.bulkCloseJobs(99L, req);

    verify(jobService).bulkCloseJobs(99L, List.of(1L, 2L));
  }

  @Test
  void bulkCloseJobs_unauth_throws401() {
    assertThrows(
        ResponseStatusException.class,
        () -> controller.bulkCloseJobs(null, new BulkActionRequest()));
  }
}

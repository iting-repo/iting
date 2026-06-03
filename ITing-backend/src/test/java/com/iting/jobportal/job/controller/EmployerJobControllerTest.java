package com.iting.jobportal.job.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.request.BulkActionRequest;
import com.iting.jobportal.job.dto.request.CreateJobRequest;
import com.iting.jobportal.job.dto.request.UpdateJobRequest;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.service.JobService;
import java.util.List;
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

/**
 * EmployerJobController là deprecated dual-mount path (Phase 4). Same logic with HrJobController.
 * Test mỗi endpoint một sanity check thay vì duplicate full coverage — đảm bảo dual-mount vẫn hoạt
 * động sau refactor.
 */
@ExtendWith(MockitoExtension.class)
@SuppressWarnings("deprecation")
class EmployerJobControllerTest {

  @Mock private JobService jobService;
  @InjectMocks private EmployerJobController controller;

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
    assertThrows(
        ResponseStatusException.class, () -> controller.createJob(null, new CreateJobRequest()));
  }

  @Test
  void updateJob_authenticated_delegatesToService() {
    JobResponse updated = JobResponse.builder().build();
    when(jobService.updateJob(99L, 5L, null)).thenReturn(updated);

    assertSame(updated, controller.updateJob(99L, 5L, null).getBody());
  }

  @Test
  void updateJob_unauth_throws401() {
    assertThrows(
        ResponseStatusException.class,
        () -> controller.updateJob(null, 5L, new UpdateJobRequest()));
  }

  @Test
  void deleteJob_authenticated() {
    controller.deleteJob(99L, 5L);
    verify(jobService).deleteJob(99L, 5L);
  }

  @Test
  void deleteJob_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.deleteJob(null, 5L));
  }

  @Test
  void extendJob_passesDays() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.extendJob(99L, 5L, 30)).thenReturn(expected);
    assertSame(expected, controller.extendJob(99L, 5L, 30).getBody());
  }

  @Test
  void extendJob_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.extendJob(null, 5L, 30));
  }

  @Test
  void closeJob_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.closeJob(null, 5L));
  }

  @Test
  void reopenJob_authenticated() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.reopenJob(99L, 5L)).thenReturn(expected);
    assertSame(expected, controller.reopenJob(99L, 5L).getBody());
  }

  @Test
  void getMyJobs_authenticated_paginated() {
    Page<JobResponse> page = new PageImpl<>(List.of());
    when(jobService.getJobsByEmployer(99L, 0, 10)).thenReturn(page);
    assertSame(page, controller.getMyJobs(99L, 0, 10).getBody());
  }

  @Test
  void getMyJobs_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.getMyJobs(null, 0, 10));
  }

  @Test
  void submitJobForReview_authenticated() {
    JobResponse expected = JobResponse.builder().build();
    when(jobService.submitJobForReview(99L, 5L)).thenReturn(expected);
    assertSame(expected, controller.submitJobForReview(99L, 5L).getBody());
  }

  @Test
  void submitJobForReview_unauth_throws401() {
    assertThrows(ResponseStatusException.class, () -> controller.submitJobForReview(null, 5L));
  }

  @Test
  void bulkDeleteJobs_authenticated() {
    BulkActionRequest req = new BulkActionRequest();
    req.setIds(List.of(1L, 2L));
    controller.bulkDeleteJobs(99L, req);
    verify(jobService).bulkDeleteJobs(99L, List.of(1L, 2L));
  }

  @Test
  void bulkDeleteJobs_unauth_throws401() {
    assertThrows(
        ResponseStatusException.class,
        () -> controller.bulkDeleteJobs(null, new BulkActionRequest()));
  }

  @Test
  void bulkCloseJobs_authenticated() {
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

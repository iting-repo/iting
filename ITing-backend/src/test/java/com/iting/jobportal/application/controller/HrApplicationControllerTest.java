package com.iting.jobportal.application.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.application.dto.request.ApplicationSearchRequest;
import com.iting.jobportal.application.dto.request.ApplicationStats;
import com.iting.jobportal.application.dto.request.UpdateApplicationStatusRequest;
import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.entity.enums.ApplicationStatus;
import com.iting.jobportal.application.service.EmployerApplicationService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class HrApplicationControllerTest {

  @Mock private EmployerApplicationService service;
  @InjectMocks private HrApplicationController controller;

  @Test
  void getApplicationsByJob_passesArgs() {
    Page<ApplicationResponse> page = new PageImpl<>(List.of());
    when(service.getApplicationsByJob(99L, 42L, 0, 10)).thenReturn(page);

    ResponseEntity<Page<ApplicationResponse>> resp =
        controller.getApplicationsByJob(99L, 42L, 0, 10);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(page, resp.getBody());
  }

  @Test
  void getAllApplications_passesEmployerAndPagination() {
    Page<ApplicationResponse> page = new PageImpl<>(List.of());
    when(service.getAllApplicationsForEmployer(99L, 0, 10)).thenReturn(page);

    assertSame(page, controller.getAllApplications(99L, 0, 10).getBody());
  }

  // ── searchApplications: builds ApplicationSearchRequest ─────────────

  @Test
  void searchApplications_buildsRequestFromQueryParams() {
    when(service.searchApplications(
            org.mockito.ArgumentMatchers.eq(99L), any(ApplicationSearchRequest.class)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.searchApplications(99L, 42L, "PENDING", "java", "timeSent", "asc", 1, 25);

    ArgumentCaptor<ApplicationSearchRequest> cap =
        ArgumentCaptor.forClass(ApplicationSearchRequest.class);
    verify(service).searchApplications(org.mockito.ArgumentMatchers.eq(99L), cap.capture());
    ApplicationSearchRequest req = cap.getValue();
    assertEquals(42L, req.getJobId());
    assertEquals(ApplicationStatus.PENDING, req.getStatus());
    assertEquals("java", req.getKeyword());
    assertEquals("timeSent", req.getSortBy());
    assertEquals("asc", req.getSortOrder());
    assertEquals(1, req.getPage());
    assertEquals(25, req.getSize());
  }

  @Test
  void searchApplications_nullStatus_leftNullInRequest() {
    when(service.searchApplications(
            org.mockito.ArgumentMatchers.eq(99L), any(ApplicationSearchRequest.class)))
        .thenReturn(new PageImpl<>(List.of()));

    controller.searchApplications(99L, null, null, null, "timeSent", "desc", 0, 10);

    ArgumentCaptor<ApplicationSearchRequest> cap =
        ArgumentCaptor.forClass(ApplicationSearchRequest.class);
    verify(service).searchApplications(org.mockito.ArgumentMatchers.eq(99L), cap.capture());
    assertNull(cap.getValue().getStatus(), "null status không được parse");
  }

  @Test
  void searchApplications_invalidStatus_throwsIllegalArgument() {
    // ApplicationStatus.valueOf throws IllegalArgumentException for unknown
    assertThrows(
        IllegalArgumentException.class,
        () ->
            controller.searchApplications(
                99L, null, "INVALID_STATUS", null, "timeSent", "desc", 0, 10));
  }

  // ── getApplication ──────────────────────────────────────────────────

  @Test
  void getApplication_delegatesToService() {
    ApplicationResponse expected = new ApplicationResponse();
    when(service.viewApplication(99L, 5L)).thenReturn(expected);

    assertSame(expected, controller.getApplication(99L, 5L).getBody());
  }

  @Test
  void markAsViewed_delegatesToService() {
    ApplicationResponse expected = new ApplicationResponse();
    when(service.markApplicationAsViewed(99L, 5L)).thenReturn(expected);

    assertSame(expected, controller.markAsViewed(99L, 5L).getBody());
  }

  @Test
  void updateStatus_delegatesToService() {
    UpdateApplicationStatusRequest req = new UpdateApplicationStatusRequest();
    ApplicationResponse expected = new ApplicationResponse();
    when(service.updateApplicationStatus(99L, 5L, req)).thenReturn(expected);

    assertSame(expected, controller.updateStatus(99L, 5L, req).getBody());
  }

  @Test
  void acceptApplication_passesNote() {
    ApplicationResponse expected = new ApplicationResponse();
    when(service.acceptApplication(99L, 5L, "Great fit")).thenReturn(expected);

    assertSame(expected, controller.acceptApplication(99L, 5L, "Great fit").getBody());
  }

  @Test
  void acceptApplication_nullNote_passedThrough() {
    when(service.acceptApplication(99L, 5L, null)).thenReturn(new ApplicationResponse());

    controller.acceptApplication(99L, 5L, null);
    verify(service).acceptApplication(99L, 5L, null);
  }

  @Test
  void rejectApplication_passesNote() {
    ApplicationResponse expected = new ApplicationResponse();
    when(service.rejectApplication(99L, 5L, "Not enough experience")).thenReturn(expected);

    assertSame(expected, controller.rejectApplication(99L, 5L, "Not enough experience").getBody());
  }

  @Test
  void getEmployerStats_delegatesToService() {
    ApplicationStats stats = ApplicationStats.builder().build();
    when(service.getStatsForEmployer(99L)).thenReturn(stats);

    assertSame(stats, controller.getEmployerStats(99L).getBody());
  }

  @Test
  void searchByCv_passesFile() {
    MockMultipartFile file =
        new MockMultipartFile("file", "cv.pdf", "application/pdf", new byte[100]);
    List<ApplicationResponse> result = List.of();
    when(service.searchCandidatesByCvFile(
            org.mockito.ArgumentMatchers.eq(99L), any(MultipartFile.class)))
        .thenReturn(result);

    assertSame(result, controller.searchByCv(99L, file).getBody());
  }

  @Test
  void searchByKeyword_passesKeyword() {
    List<ApplicationResponse> result = List.of();
    when(service.searchCandidatesByCvKeyword(99L, "java spring")).thenReturn(result);

    assertSame(result, controller.searchByKeyword(99L, "java spring").getBody());
  }

  @Test
  void getApplicationsRankedByMatch_aiRanking() {
    Page<ApplicationResponse> page = new PageImpl<>(List.of());
    when(service.getApplicationsRankedByMatch(99L, 42L, 0, 20)).thenReturn(page);

    assertSame(page, controller.getApplicationsRankedByMatch(99L, 42L, 0, 20).getBody());
  }
}

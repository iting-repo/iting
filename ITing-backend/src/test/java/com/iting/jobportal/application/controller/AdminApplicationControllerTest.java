package com.iting.jobportal.application.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.application.dto.response.ApplicationResponse;
import com.iting.jobportal.application.dto.response.JobApplicationStatsResponse;
import com.iting.jobportal.application.service.AdminApplicationService;
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

@ExtendWith(MockitoExtension.class)
class AdminApplicationControllerTest {

  @Mock private AdminApplicationService adminApplicationService;
  @InjectMocks private AdminApplicationController controller;

  @Test
  void getAllSystemApplications_passesPageAndSize() {
    Page<ApplicationResponse> expected = new PageImpl<>(List.of());
    when(adminApplicationService.getAllSystemApplications(2, 50)).thenReturn(expected);

    ResponseEntity<Page<ApplicationResponse>> resp = controller.getAllSystemApplications(2, 50);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }

  @Test
  void deleteApplication_callsService_returnsMessage() {
    ResponseEntity<?> resp = controller.deleteApplication(42L);

    verify(adminApplicationService).deleteApplication(42L);
    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertEquals("Deleted application", ((Map<?, ?>) resp.getBody()).get("message"));
  }

  @Test
  void getByJob_passesAllArgs() {
    Page<ApplicationResponse> expected = new PageImpl<>(List.of());
    when(adminApplicationService.getApplicationsByJob(7L, 0, 20)).thenReturn(expected);

    ResponseEntity<Page<ApplicationResponse>> resp = controller.getByJob(7L, 0, 20);

    assertSame(expected, resp.getBody());
  }

  @Test
  void getStatsByJob_delegatesToService() {
    JobApplicationStatsResponse expected = new JobApplicationStatsResponse();
    when(adminApplicationService.getApplicationStatsByJob(7L)).thenReturn(expected);

    ResponseEntity<JobApplicationStatsResponse> resp = controller.getStatsByJob(7L);

    assertSame(expected, resp.getBody());
  }
}

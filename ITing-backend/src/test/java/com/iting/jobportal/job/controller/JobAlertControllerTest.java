package com.iting.jobportal.job.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.job.dto.FollowedCompanyJobResponse;
import com.iting.jobportal.job.service.JobAlertService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class JobAlertControllerTest {

  @Mock private JobAlertService jobAlertService;
  @InjectMocks private JobAlertController controller;

  @Test
  void getJobAlerts_passesPaginationWithCreatedAtDescSort() {
    Page<FollowedCompanyJobResponse> page = new PageImpl<>(List.of());
    when(jobAlertService.getJobsFromFollowedCompanies(eq(1L), any(PageRequest.class)))
        .thenReturn(page);

    ResponseEntity<Page<FollowedCompanyJobResponse>> resp = controller.getJobAlerts(1L, 0, 10);

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(page, resp.getBody());

    ArgumentCaptor<PageRequest> cap = ArgumentCaptor.forClass(PageRequest.class);
    verify(jobAlertService).getJobsFromFollowedCompanies(eq(1L), cap.capture());
    Sort.Order order = cap.getValue().getSort().getOrderFor("createdAt");
    assertTrue(order.isDescending(), "Sort theo createdAt DESC để latest job hiện trước");
  }
}

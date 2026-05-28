package com.iting.jobportal.admin.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.DashboardStats;
import com.iting.jobportal.admin.service.AdminDashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AdminDashboardControllerTest {

  @Mock private AdminDashboardService adminDashboardService;
  @InjectMocks private AdminDashboardController controller;

  @Test
  void getStats_delegatesToService() {
    DashboardStats expected = DashboardStats.builder().totalUsers(100L).build();
    when(adminDashboardService.getDashboardStats()).thenReturn(expected);

    ResponseEntity<DashboardStats> resp = controller.getStats();

    assertEquals(HttpStatus.OK, resp.getStatusCode());
    assertSame(expected, resp.getBody());
  }
}

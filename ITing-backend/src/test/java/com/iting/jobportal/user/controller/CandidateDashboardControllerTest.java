package com.iting.jobportal.user.controller;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

import com.iting.jobportal.user.dto.CandidateDashboardStats;
import com.iting.jobportal.user.service.CandidateDashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CandidateDashboardControllerTest {

  @Mock private CandidateDashboardService dashboardService;
  @InjectMocks private CandidateDashboardController controller;

  @Test
  void getDashboardStats_delegates() {
    CandidateDashboardStats stats = new CandidateDashboardStats();
    when(dashboardService.getDashboardStats(1L)).thenReturn(stats);

    assertSame(stats, controller.getDashboardStats(1L).getBody());
  }
}

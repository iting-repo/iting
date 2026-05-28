package com.iting.jobportal.admin.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.iting.jobportal.admin.dto.DashboardStats;
import com.iting.jobportal.admin.service.impl.AdminDashboardServiceImpl;
import com.iting.jobportal.application.repository.AdminApplicationRepository;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.job.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceImplTest {

  @Mock private AccountRepository accountRepository;

  @Mock private JobRepository jobRepository;

  @Mock private AdminApplicationRepository adminApplicationRepository;

  @InjectMocks private AdminDashboardServiceImpl service;

  @Test
  void getDashboardStats_shouldReturnEmptyStatsObject() {
    DashboardStats stats = service.getDashboardStats();

    assertNotNull(stats);
  }
}

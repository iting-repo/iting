package com.iting.jobportal.job.task;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class JobExpirySchedulerTest {

  @Mock private JobRepository jobRepository;
  @Mock private AdminConfigService adminConfigService;
  @InjectMocks private JobExpiryScheduler scheduler;

  @Test
  void doesNothing_whenJobExpiryDaysDisabled() {
    // jobExpiryDays <= 0 → tắt scheduler
    when(adminConfigService.getConfig())
        .thenReturn(SystemConfig.builder().jobExpiryDays(0).build());

    scheduler.expireOverdueJobs();

    verify(jobRepository, never()).expirePastDueJobs(any(), any());
  }

  @Test
  void doesNothing_whenJobExpiryDaysNull() {
    when(adminConfigService.getConfig())
        .thenReturn(SystemConfig.builder().jobExpiryDays(null).build());

    scheduler.expireOverdueJobs();

    verify(jobRepository, never()).expirePastDueJobs(any(), any());
  }

  @Test
  void expiresOnlyPastDueJobs_whenEnabled() {
    when(adminConfigService.getConfig())
        .thenReturn(SystemConfig.builder().jobExpiryDays(30).build());
    when(jobRepository.expirePastDueJobs(eq(JobStatus.EXPIRED), eq(JobStatus.ACTIVE)))
        .thenReturn(2);

    scheduler.expireOverdueJobs();

    // Đóng theo dueDate quá hạn, KHÔNG theo tuổi createdAt
    verify(jobRepository).expirePastDueJobs(eq(JobStatus.EXPIRED), eq(JobStatus.ACTIVE));
  }
}

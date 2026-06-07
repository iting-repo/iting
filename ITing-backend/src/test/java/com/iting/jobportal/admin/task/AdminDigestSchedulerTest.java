package com.iting.jobportal.admin.task;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.dto.DashboardStats;
import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import com.iting.jobportal.admin.service.AdminDashboardService;
import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.auth.entity.Enum.Role;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.common.service.EmailService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminDigestSchedulerTest {

  @Mock private AdminConfigService adminConfigService;
  @Mock private AdminDashboardService adminDashboardService;
  @Mock private AccountRepository accountRepository;
  @Mock private EmailService emailService;
  @InjectMocks private AdminDigestScheduler scheduler;

  @Test
  void doesNotSend_whenDigestOff() {
    when(adminConfigService.getConfig())
        .thenReturn(SystemConfig.builder().emailDigest("off").build());

    scheduler.sendDigest();

    verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
  }

  @Test
  void sendsDigestToAdmins_whenDaily() {
    when(adminConfigService.getConfig())
        .thenReturn(SystemConfig.builder().emailDigest("daily").build());
    when(accountRepository.findByRole(Role.ADMIN))
        .thenReturn(List.of(Account.builder().email("admin@iting.com").build()));
    when(adminDashboardService.getDashboardStats())
        .thenReturn(
            DashboardStats.builder()
                .totalUsers(10)
                .totalJobs(5)
                .totalApplications(20)
                .pendingApplications(3)
                .build());

    scheduler.sendDigest();

    verify(emailService).sendEmail(eq("admin@iting.com"), anyString(), anyString());
  }
}

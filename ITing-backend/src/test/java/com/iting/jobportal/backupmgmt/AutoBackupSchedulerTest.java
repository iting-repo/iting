package com.iting.jobportal.backupmgmt;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.admin.entity.SystemConfig;
import com.iting.jobportal.admin.service.AdminConfigService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AutoBackupSchedulerTest {

  @Mock private BackupService backupService;
  @Mock private AdminConfigService adminConfigService;
  @InjectMocks private AutoBackupScheduler scheduler;

  private BackupService.BackupResult dummyResult() {
    return new BackupService.BackupResult("snap", "ok", "dump.sql", 1L, Instant.now().toString());
  }

  @Test
  void noBackup_whenAutoBackupDisabled() {
    when(adminConfigService.getConfig())
        .thenReturn(SystemConfig.builder().autoBackup(false).build());

    scheduler.runScheduledBackup();

    verify(backupService, never()).createBackup();
  }

  @Test
  void createsBackup_whenDailyEnabled() {
    when(adminConfigService.getConfig())
        .thenReturn(
            SystemConfig.builder()
                .autoBackup(true)
                .backupFrequency("daily")
                .backupRetention(0) // tắt dọn dẹp cho test này
                .build());
    when(backupService.createBackup()).thenReturn(dummyResult());

    scheduler.runScheduledBackup();

    verify(backupService).createBackup();
  }

  @Test
  void cleansUpOldBackups_beyondRetention() {
    when(adminConfigService.getConfig())
        .thenReturn(
            SystemConfig.builder()
                .autoBackup(true)
                .backupFrequency("daily")
                .backupRetention(30)
                .build());
    when(backupService.createBackup()).thenReturn(dummyResult());

    String oldTime = Instant.now().minus(40, ChronoUnit.DAYS).toString();
    String newTime = Instant.now().toString();
    when(backupService.getBackupHistory())
        .thenReturn(
            List.of(
                new BackupService.BackupInfo("old.sql", "auto", oldTime, 1L, "k1"),
                new BackupService.BackupInfo("new.sql", "auto", newTime, 1L, "k2")));

    scheduler.runScheduledBackup();

    verify(backupService).deleteBackup("old.sql");
    verify(backupService, never()).deleteBackup("new.sql");
  }
}

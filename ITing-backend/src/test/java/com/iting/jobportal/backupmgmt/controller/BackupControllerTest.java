package com.iting.jobportal.backupmgmt.controller;

import com.iting.jobportal.backupmgmt.BackupService;
import com.iting.jobportal.backupmgmt.BackupService.BackupInfo;
import com.iting.jobportal.backupmgmt.BackupService.BackupResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BackupControllerTest {

    @Mock private BackupService backupService;
    @InjectMocks private BackupController controller;

    @Test
    void createBackup_delegatesToService() {
        BackupResult result = new BackupResult("snap-123", "completed", "backups/x.dump", 1024L, "2026-05-28T00:00:00");
        when(backupService.createBackup()).thenReturn(result);

        ResponseEntity<BackupResult> resp = controller.createBackup();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertSame(result, resp.getBody());
    }

    @Test
    void getBackupHistory_delegatesToService() {
        List<BackupInfo> history = List.of(
                new BackupInfo("backup-1", "manual", "2026-05-01T10:00:00", 1024L, "s3://k"));
        when(backupService.getBackupHistory()).thenReturn(history);

        assertSame(history, controller.getBackupHistory().getBody());
    }

    @Test
    void deleteBackup_callsService_returnsOk() {
        ResponseEntity<Void> resp = controller.deleteBackup("backup-1");

        verify(backupService).deleteBackup("backup-1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }
}

package com.iting.jobportal.backupmgmt.controller;

import com.iting.jobportal.backupmgmt.BackupService;
import com.iting.jobportal.backupmgmt.BackupService.BackupInfo;
import com.iting.jobportal.backupmgmt.BackupService.BackupResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/backup")
@RequiredArgsConstructor
@Tag(name = "Backup Management", description = "Admin APIs for managing database backups")
public class BackupController {

    private final BackupService backupService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new backup (RDS snapshot + pg_dump)")
    public ResponseEntity<BackupResult> createBackup() {
        BackupResult result = backupService.createBackup();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get backup history from S3")
    public ResponseEntity<List<BackupInfo>> getBackupHistory() {
        List<BackupInfo> history = backupService.getBackupHistory();
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/{backupName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a backup from S3")
    public ResponseEntity<Void> deleteBackup(@PathVariable String backupName) {
        backupService.deleteBackup(backupName);
        return ResponseEntity.ok().build();
    }
}

package com.iting.jobportal.backupmgmt;

import java.util.List;

public interface BackupService {

    record BackupResult(
            String snapshotId,
            String snapshotStatus,
            String dumpFileKey,
            long dumpFileSize,
            String backupTime
    ) {}

    record BackupInfo(
            String name,
            String type,
            String createdAt,
            long size,
            String s3Key
    ) {}

    BackupResult createBackup();

    List<BackupInfo> getBackupHistory();

    void deleteBackup(String backupName);
}

package com.iting.jobportal.backupmgmt.impl;

import com.iting.jobportal.backupmgmt.BackupService;
import java.io.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.GZIPOutputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rds.RdsClient;
import software.amazon.awssdk.services.rds.model.*;

@Service
@Slf4j
public class BackupServiceImpl implements BackupService {

  @Value("${aws.s3.access-key}")
  private String accessKey;

  @Value("${aws.s3.secret-key}")
  private String secretKey;

  @Value("${aws.s3.region}")
  private String region;

  @Value("${aws.s3.bucket}")
  private String bucketName;

  @Value("${spring.datasource.url}")
  private String datasourceUrl;

  @Value("${spring.datasource.username}")
  private String dbUsername;

  @Value("${spring.datasource.password}")
  private String dbPassword;

  @Value("${aws.rds.db-instance-identifier:iting-db}")
  private String dbInstanceIdentifier;

  private static final String BACKUP_PREFIX = "backup/";
  private static final String PGDUMP_PATH = "/usr/bin/pg_dump";

  @Override
  public BackupResult createBackup() {
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

    String snapshotId = createRdsSnapshot(timestamp);
    String dumpFileKey = createPgDumpAndUpload(timestamp, datePrefix);

    return new BackupResult(snapshotId, "creating", dumpFileKey, 0L, timestamp);
  }

  private String createRdsSnapshot(String timestamp) {
    String snapshotId = "iting-backup-" + timestamp;

    try (RdsClient rdsClient = createRdsClient()) {
      CreateDbSnapshotRequest request =
          CreateDbSnapshotRequest.builder()
              .dbInstanceIdentifier(dbInstanceIdentifier)
              .dbSnapshotIdentifier(snapshotId)
              .tags(Tag.builder().key("CreatedBy").value("ITing-BackupService").build())
              .build();

      CreateDbSnapshotResponse response = rdsClient.createDBSnapshot(request);
      String arn = response.dbSnapshot().dbSnapshotArn();

      log.info("Created RDS snapshot: {} with ARN: {}", snapshotId, arn);
      return snapshotId;

    } catch (RdsException e) {
      log.error("Failed to create RDS snapshot: {}", e.getMessage());
      throw new RuntimeException("Failed to create RDS snapshot: " + e.getMessage(), e);
    }
  }

  private String createPgDumpAndUpload(String timestamp, String datePrefix) {
    File dumpFile = null;
    File gzipFile = null;

    try {
      dumpFile = File.createTempFile("iting_backup_" + timestamp, ".sql");

      String[] pgDumpCommand;
      if (System.getProperty("os.name").toLowerCase().contains("win")) {
        pgDumpCommand =
            new String[] {
              "pg_dump",
              "-h",
              extractHost(),
              "-p",
              extractPort(),
              "-U",
              dbUsername,
              "-d",
              extractDbName(),
              "-f",
              dumpFile.getAbsolutePath(),
              "-F",
              "c",
              "-b",
              "-v"
            };
      } else {
        pgDumpCommand =
            new String[] {
              PGDUMP_PATH,
              "-h",
              extractHost(),
              "-p",
              extractPort(),
              "-U",
              dbUsername,
              "-d",
              extractDbName(),
              "-f",
              dumpFile.getAbsolutePath(),
              "-F",
              "c",
              "-b"
            };
      }

      ProcessBuilder pb = new ProcessBuilder(pgDumpCommand);
      pb.environment().put("PGPASSWORD", dbPassword);
      pb.environment().put("PATH", System.getenv("PATH"));

      if (!System.getProperty("os.name").toLowerCase().contains("win")) {
        pb.environment().put("LD_LIBRARY_PATH", "/usr/lib/postgresql/16/lib");
      }

      Process process = pb.start();

      int exitCode = process.waitFor();
      if (exitCode != 0) {
        try (BufferedReader reader =
            new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
          StringBuilder errorMsg = new StringBuilder();
          String line;
          while ((line = reader.readLine()) != null) {
            errorMsg.append(line).append("\n");
          }
          log.error("pg_dump error output: {}", errorMsg);
        }
        throw new RuntimeException("pg_dump failed with exit code: " + exitCode);
      }

      log.info("pg_dump completed successfully, compressing...");

      gzipFile = File.createTempFile("iting_backup_" + timestamp, ".sql.gz");
      try (FileInputStream fis = new FileInputStream(dumpFile);
          FileOutputStream fos = new FileOutputStream(gzipFile);
          GZIPOutputStream gzos = new GZIPOutputStream(fos)) {

        byte[] buffer = new byte[8192];
        int len;
        while ((len = fis.read(buffer)) > 0) {
          gzos.write(buffer, 0, len);
        }
      }

      log.info("Compression completed, uploading to S3...");

      String s3Key = BACKUP_PREFIX + datePrefix + "/" + timestamp + "-dump.backup";
      uploadToS3(gzipFile, s3Key);

      log.info("Backup uploaded to S3: {}", s3Key);
      return s3Key;

    } catch (Exception e) {
      log.error("Failed to create pg_dump backup: {}", e.getMessage());
      throw new RuntimeException("Failed to create pg_dump backup: " + e.getMessage(), e);
    } finally {
      if (dumpFile != null && dumpFile.exists()) {
        dumpFile.delete();
      }
      if (gzipFile != null && gzipFile.exists()) {
        gzipFile.delete();
      }
    }
  }

  private RdsClient createRdsClient() {
    AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
    return RdsClient.builder()
        .region(Region.of(region))
        .credentialsProvider(StaticCredentialsProvider.create(credentials))
        .build();
  }

  private void uploadToS3(File file, String s3Key) throws IOException {
    try (FileInputStream fis = new FileInputStream(file)) {
      software.amazon.awssdk.core.sync.RequestBody body =
          software.amazon.awssdk.core.sync.RequestBody.fromInputStream(fis, file.length());

      software.amazon.awssdk.services.s3.S3Client s3Client =
          software.amazon.awssdk.services.s3.S3Client.builder()
              .region(Region.of(region))
              .credentialsProvider(
                  StaticCredentialsProvider.create(
                      AwsBasicCredentials.create(accessKey, secretKey)))
              .build();

      software.amazon.awssdk.services.s3.model.PutObjectRequest request =
          software.amazon.awssdk.services.s3.model.PutObjectRequest.builder()
              .bucket(bucketName)
              .key(s3Key)
              .contentType("application/octet-stream")
              .build();

      s3Client.putObject(request, body);
    }
  }

  private String extractHost() {
    String url = datasourceUrl;
    url = url.replace("jdbc:postgresql://", "");
    int slashIndex = url.indexOf('/');
    int colonIndex = url.indexOf(':');
    if (colonIndex > 0 && (slashIndex < 0 || colonIndex < slashIndex)) {
      return url.substring(0, colonIndex);
    }
    if (slashIndex > 0) {
      return url.substring(0, slashIndex);
    }
    return url.split("@")[1].split(":")[0];
  }

  private String extractPort() {
    String url = datasourceUrl.replace("jdbc:postgresql://", "");
    int slashIndex = url.indexOf('/');
    String hostPart = slashIndex > 0 ? url.substring(0, slashIndex) : url;
    int colonIndex = hostPart.indexOf(':');
    if (colonIndex > 0) {
      return hostPart.substring(colonIndex + 1);
    }
    return "5432";
  }

  private String extractDbName() {
    String url = datasourceUrl;
    int slashIndex = url.lastIndexOf('/');
    int questionIndex = url.indexOf('?');
    if (slashIndex > 0) {
      String dbPart = url.substring(slashIndex + 1);
      if (questionIndex > 0) {
        dbPart = dbPart.substring(0, questionIndex);
      }
      return dbPart;
    }
    return "postgres";
  }

  @Override
  public List<BackupInfo> getBackupHistory() {
    List<BackupInfo> backups = new ArrayList<>();

    try {
      software.amazon.awssdk.services.s3.S3Client s3Client =
          software.amazon.awssdk.services.s3.S3Client.builder()
              .region(Region.of(region))
              .credentialsProvider(
                  StaticCredentialsProvider.create(
                      AwsBasicCredentials.create(accessKey, secretKey)))
              .build();

      software.amazon.awssdk.services.s3.model.ListObjectsV2Request listRequest =
          software.amazon.awssdk.services.s3.model.ListObjectsV2Request.builder()
              .bucket(bucketName)
              .prefix(BACKUP_PREFIX)
              .build();

      software.amazon.awssdk.services.s3.model.ListObjectsV2Response response =
          s3Client.listObjectsV2(listRequest);

      for (software.amazon.awssdk.services.s3.model.S3Object s3Object : response.contents()) {
        String key = s3Object.key();
        String fileName = key.substring(key.lastIndexOf('/') + 1);
        String type = key.endsWith(".backup") ? "pg_dump" : "snapshot";

        backups.add(
            new BackupInfo(
                fileName, type, s3Object.lastModified().toString(), s3Object.size(), key));
      }

    } catch (Exception e) {
      log.error("Failed to list backup history from S3: {}", e.getMessage());
    }

    backups.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
    return backups;
  }

  @Override
  public void deleteBackup(String backupName) {
    try {
      software.amazon.awssdk.services.s3.S3Client s3Client =
          software.amazon.awssdk.services.s3.S3Client.builder()
              .region(Region.of(region))
              .credentialsProvider(
                  StaticCredentialsProvider.create(
                      AwsBasicCredentials.create(accessKey, secretKey)))
              .build();

      String s3Key = BACKUP_PREFIX + backupName;

      software.amazon.awssdk.services.s3.model.DeleteObjectRequest deleteRequest =
          software.amazon.awssdk.services.s3.model.DeleteObjectRequest.builder()
              .bucket(bucketName)
              .key(s3Key)
              .build();

      s3Client.deleteObject(deleteRequest);
      log.info("Deleted backup from S3: {}", s3Key);

    } catch (Exception e) {
      log.error("Failed to delete backup {}: {}", backupName, e.getMessage());
      throw new RuntimeException("Failed to delete backup: " + e.getMessage(), e);
    }
  }
}

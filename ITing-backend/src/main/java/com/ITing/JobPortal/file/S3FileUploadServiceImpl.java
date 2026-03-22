package com.iting.jobportal.file;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "aws.enabled", havingValue = "true")
public class S3FileUploadServiceImpl implements FileUploadService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region}")
    private String region;

    @Override
    public String uploadCV(MultipartFile file) {
        return upload(file, "cv");
    }

    @Override
    public String uploadPortfolio(MultipartFile file) {
        return upload(file, "portfolio");
    }

    @Override
    public String uploadAvatar(MultipartFile file) {
        return upload(file, "avatar");
    }

    /**
     * Delete a file from S3 by its full URL.
     */
    public void deleteByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        // Extract key from URL: https://<bucket>.s3.<region>.amazonaws.com/<key>
        String prefix = "amazonaws.com/";
        int idx = fileUrl.indexOf(prefix);
        if (idx >= 0) {
            String key = fileUrl.substring(idx + prefix.length());
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());
        }
    }

    // ========== PRIVATE HELPERS ==========

    private String upload(MultipartFile file, String folder) {
        String originalFilename = file.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : "";
        String key = folder + "/" + UUID.randomUUID() + ext;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }

        return buildPublicUrl(key);
    }

    private String buildPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }
}

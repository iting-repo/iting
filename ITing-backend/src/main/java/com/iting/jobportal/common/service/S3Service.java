package com.iting.jobportal.common.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface S3Service {
    /**
     * Upload file to S3 and return the S3 key
     */
    String uploadFile(MultipartFile file, String folder) throws IOException;

    /**
     * Delete file from S3
     */
    void deleteFile(String s3Key);

    /**
     * Get pre-signed URL for file download (valid for 1 hour)
     */
    String getPreSignedUrl(String s3Key);

    /**
     * Generate S3 key for CV file
     */
    String generateCvS3Key(Long userId, String originalFilename);
}

package com.iting.jobportal.file;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

    String uploadPortfolio(MultipartFile file);

    String uploadCV(MultipartFile file);

    String generatePresignedUrl(String fileUrl, int minutes);

    String uploadAvatar(MultipartFile file);

    String uploadBusinessLicense(MultipartFile file);

    String uploadConsentDocument(MultipartFile file);

    void deleteByUrl(String fileUrl);
}

package com.iting.jobportal.file;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

    String uploadPortfolio(MultipartFile file);

    String uploadCV(MultipartFile file);

    String generatePresignedUrl(String fileUrl, int minutes);

    String uploadAvatar(MultipartFile file);

    String uploadBusinessLicense(MultipartFile file);

    String uploadConsentDocument(MultipartFile file);

    String uploadLogo(MultipartFile file);

    /** Upload image dùng trong rich-text editor (blog content). */
    String uploadBlogImage(MultipartFile file);

    /**
     * Upload raw bytes (e.g. generated PDF invoice/report) to the configured storage
     * under a specific key. Returns the public URL where the object can be fetched.
     */
    String uploadBytes(byte[] bytes, String key, String contentType);

    void deleteByUrl(String fileUrl);
}

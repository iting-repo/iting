package com.iting.jobportal.file;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

    String uploadAvatar(MultipartFile file);

    String uploadCV(MultipartFile file);

    String uploadPortfolio(MultipartFile file);
}

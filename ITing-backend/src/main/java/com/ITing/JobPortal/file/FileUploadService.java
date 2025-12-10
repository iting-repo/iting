package com.iting.jobportal.file;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

    String uploadPortfolio(MultipartFile file);

    String uploadCV(MultipartFile file);

    String uploadAvatar(MultipartFile file);
}

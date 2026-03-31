package com.iting.jobportal.file;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "aws.enabled", havingValue = "false", matchIfMissing = true)
public class LocalFileUploadServiceImpl implements FileUploadService {

    private final String UPLOAD_DIR = "uploads/";

    @Override
    public String uploadPortfolio(MultipartFile file) {
        return saveFile(file, "portfolio");
    }

    @Override
    public String uploadCV(MultipartFile file) {
        return saveFile(file, "cv");
    }

    @Override
    public String uploadAvatar(MultipartFile file) {
        return saveFile(file, "avatar");
    }

    @Override
    public String uploadBusinessLicense(MultipartFile file) {
        return saveFile(file, "business-license");
    }

    @Override
    public void deleteByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            String relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            Path filePath = Paths.get(relativePath);
            Files.deleteIfExists(filePath);

        } catch (IOException e) {
            throw new RuntimeException("Cannot delete file", e);
        }
    }

    @Override
    public String generatePresignedUrl(String fileUrl, int minutes) {
        // Local thì không cần presigned, trả luôn URL
        return fileUrl;
    }

    private String saveFile(MultipartFile file, String folder) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR + folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String fileName = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID() + ext;

            Path filePath = uploadPath.resolve(fileName);

            file.transferTo(filePath.toFile());

            return "/" + UPLOAD_DIR + folder + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Cannot save file", e);
        }
    }
}
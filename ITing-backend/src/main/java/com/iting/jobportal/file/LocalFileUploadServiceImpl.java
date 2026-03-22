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

    private String saveFile(MultipartFile file, String folder) {
        try {
            // Tạo folder nếu không tồn tại
            Path uploadPath = Paths.get(UPLOAD_DIR + folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tên file lưu xuống máy
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            // Đường dẫn cuối cùng
            Path filePath = uploadPath.resolve(fileName);

            // Ghi file xuống ổ đĩa
            file.transferTo(filePath.toFile());

            // Trả về URL (local path)
            return "/" + UPLOAD_DIR + folder + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Cannot save file", e);
        }
    }
}

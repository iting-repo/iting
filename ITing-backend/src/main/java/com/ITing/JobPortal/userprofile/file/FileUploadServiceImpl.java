package com.iting.jobportal.userprofile.file;

import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements com.iting.jobportal.file.FileUploadService {

    private final com.iting.jobportal.userprofile.file.Cloudinary cloudinary;

    private String uploadToCloudinary(MultipartFile file, String folder) {
        try {
            String publicId = folder + UUID.randomUUID();

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "public_id", publicId,
                            "resource_type", "auto" // pdf, png, jpg…
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }

    @Override
    public String uploadAvatar(MultipartFile file) {
        return uploadToCloudinary(file, "iting/avatar/");
    }

    @Override
    public String uploadCV(MultipartFile file) {
        return uploadToCloudinary(file, "iting/cv/");
    }

    @Override
    public String uploadPortfolio(MultipartFile file) {
        return uploadToCloudinary(file, "iting/portfolio/");
    }
}

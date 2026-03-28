package com.iting.jobportal.userprofile.service.impl;

import com.iting.jobportal.common.service.S3Service;
import com.iting.jobportal.userprofile.dto.response.CVResponse;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.CVService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVServiceImpl implements CVService {

    private final CVRepository cvRepository;
    private final UserProfileRepository userProfileRepository;
    private final S3Service s3Service;

    private static final int MAX_CVS_PER_USER = 3;

    @Override
    @Transactional(readOnly = true)
    public List<CVResponse> getRecentCVs(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found with id: " + userId));

        List<CV> recentCVs = cvRepository.findTop3ByProfileIdOrderByUploadedAtDesc(
                profile.getId(), 
                PageRequest.of(0, MAX_CVS_PER_USER)
        );

        return recentCVs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CVResponse uploadCV(Long userId, MultipartFile file, String title) throws IOException {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found with id: " + userId));

        // Check if user has reached the limit
        long cvCount = cvRepository.countByProfile_Id(profile.getId());
        if (cvCount >= MAX_CVS_PER_USER) {
            manageUserCVLimit(userId);
        }

        // Upload to S3
        String s3Key = s3Service.generateCvS3Key(userId, file.getOriginalFilename());
        String uploadedS3Key = s3Service.uploadFile(file, "cvs/user_" + userId);
        
        // Get pre-signed URL for accessing the file
        String fileUrl = s3Service.getPreSignedUrl(uploadedS3Key);

        // Save CV entity
        CV cv = CV.builder()
                .profile(profile)
                .title(title != null ? title : file.getOriginalFilename())
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .s3Key(uploadedS3Key)
                .uploadedAt(LocalDateTime.now())
                .isDefault(false)
                .build();

        CV savedCV = cvRepository.save(cv);
        log.info("Successfully uploaded CV for user {}: {}", userId, savedCV.getId());

        return convertToResponse(savedCV);
    }

    @Override
    @Transactional
    public void manageUserCVLimit(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found with id: " + userId));

        long cvCount = cvRepository.countByProfile_Id(profile.getId());
        
        if (cvCount >= MAX_CVS_PER_USER) {
            // Find the oldest CV
            CV oldestCV = cvRepository.findFirstByProfile_IdOrderByUploadedAtAsc(profile.getId());
            
            if (oldestCV != null) {
                // Delete from S3 if s3Key exists
                if (oldestCV.getS3Key() != null && !oldestCV.getS3Key().isEmpty()) {
                    try {
                        s3Service.deleteFile(oldestCV.getS3Key());
                        log.info("Deleted old CV from S3: {}", oldestCV.getS3Key());
                    } catch (Exception e) {
                        log.error("Failed to delete CV from S3: {}", oldestCV.getS3Key(), e);
                    }
                }
                
                // Delete from database
                cvRepository.delete(oldestCV);
                log.info("Deleted oldest CV for user {}: {}", userId, oldestCV.getId());
            }
        }
    }

    private CVResponse convertToResponse(CV cv) {
        return CVResponse.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .fileName(cv.getFileName())
                .fileUrl(cv.getFileUrl())
                .uploadedAt(cv.getUploadedAt())
                .build();
    }
}

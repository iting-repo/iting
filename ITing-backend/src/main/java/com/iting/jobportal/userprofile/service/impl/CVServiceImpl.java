package com.iting.jobportal.userprofile.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.S3Service;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.response.CVResponse;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.CVService;
import com.iting.jobportal.userprofile.service.embedding.HuggingFaceCvExtractionClient;
import jakarta.persistence.EntityManager;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class CVServiceImpl implements CVService {

  private final CVRepository cvRepository;
  private final UserProfileRepository userProfileRepository;
  private final UserRepository userRepository;
  private final S3Service s3Service;
  private final EntityManager entityManager;
  private final HuggingFaceCvExtractionClient hfCvExtractionClient;
  private final ObjectMapper objectMapper;

  private static final int MAX_CVS_PER_USER = 3;

  @Override
  @Transactional(readOnly = true)
  public List<CVResponse> getRecentCVs(Long userId) {
    // Trong transaction read-only, không tạo profile mới — chỉ trả list rỗng nếu chưa có
    UserProfile profile = userProfileRepository.findById(userId).orElse(null);
    if (profile == null) {
      return List.of();
    }

    List<CV> recentCVs =
        cvRepository.findTop3ByProfileIdOrderByUploadedAtDesc(
            profile.getId(), PageRequest.of(0, MAX_CVS_PER_USER));

    return recentCVs.stream().map(this::convertToResponse).collect(Collectors.toList());
  }

  @Override
  @Transactional
  public CVResponse uploadCV(Long userId, MultipartFile file, String title) throws IOException {
    UserProfile profile = getOrCreateProfile(userId);

    // Check if user has reached the limit
    long cvCount = cvRepository.countByProfile_Id(profile.getId());
    if (cvCount >= MAX_CVS_PER_USER) {
      manageUserCVLimit(userId);
    }

    // Upload to S3
    String uploadedS3Key = s3Service.uploadFile(file, "cvs/user_" + userId);

    // Get pre-signed URL for accessing the file
    String fileUrl = s3Service.getPreSignedUrl(uploadedS3Key);

    // Save CV entity
    CV cv =
        CV.builder()
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

    // Gọi HF /extract-cv để parse + embed CV. Best-effort: nếu HF lỗi,
    // CV vẫn lưu thành công, embedding sẽ NULL (có thể retry sau).
    enrichCvWithAiExtraction(savedCV, file);

    return convertToResponse(savedCV);
  }

  /**
   * Gọi HF /extract-cv, parse extracted_data + embedding rồi lưu vào CV. Lỗi từ HF được nuốt (log
   * warning) để không ảnh hưởng tới upload chính.
   */
  private void enrichCvWithAiExtraction(CV cv, MultipartFile file) {
    try {
      hfCvExtractionClient
          .extract(file)
          .ifPresent(
              result -> {
                if (!result.isSuccess()) {
                  log.warn(
                      "HF extract-cv non-success for cvId={}: status={} error={}",
                      cv.getId(),
                      result.status(),
                      result.error());
                  return;
                }
                try {
                  if (result.extractedData() != null) {
                    cv.setExtractedDataJson(
                        objectMapper.writeValueAsString(result.extractedData()));
                  }
                  if (result.embedding() != null && result.embedding().length > 0) {
                    cv.setCvEmbedding(objectMapper.writeValueAsString(result.embedding()));
                    cv.setEmbeddingUpdatedAt(LocalDateTime.now());
                  }
                  cvRepository.save(cv);
                  log.info(
                      "Enriched cvId={} with HF extraction (dim={})",
                      cv.getId(),
                      result.embedding() != null ? result.embedding().length : 0);
                } catch (Exception e) {
                  log.warn(
                      "Failed to persist HF extraction for cvId={}: {}",
                      cv.getId(),
                      e.getMessage());
                }
              });
    } catch (Exception e) {
      log.warn("HF extract-cv call failed for cvId={}: {}", cv.getId(), e.getMessage());
    }
  }

  @Override
  @Transactional
  public void manageUserCVLimit(Long userId) {
    UserProfile profile = getOrCreateProfile(userId);

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

  private UserProfile getOrCreateProfile(Long userId) {
    UserProfile existingProfile = userProfileRepository.findById(userId).orElse(null);
    if (existingProfile != null) {
      return existingProfile;
    }

    if (!userRepository.existsById(userId)) {
      throw new RuntimeException("User not found with id: " + userId);
    }

    User userRef = entityManager.getReference(User.class, userId);
    UserProfile profile = new UserProfile();
    profile.setUser(userRef);
    userProfileRepository.saveAndFlush(profile);

    return userProfileRepository
        .findById(userId)
        .orElseThrow(
            () -> new RuntimeException("Failed to initialize user profile with id: " + userId));
  }
}

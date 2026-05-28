package com.iting.jobportal.user.service;

import com.iting.jobportal.application.entity.ApplyForm;
import com.iting.jobportal.application.entity.ApplyFormSentToJob;
import com.iting.jobportal.application.repository.ApplyFormSentToJobRepository;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.repository.UserSaveJobRepository;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.service.NotificationService;
import com.iting.jobportal.user.dto.CandidateDashboardStats;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CandidateDashboardService {

  private final UserRepository userRepository;
  private final UserProfileRepository userProfileRepository;
  private final UserSaveJobRepository userSaveJobRepository;
  private final NotificationService notificationService;
  private final ApplyFormSentToJobRepository applyFormSentToJobRepository;
  private final JobRepository jobRepository;

  public CandidateDashboardStats getDashboardStats(Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    var account = user != null ? user.getAccount() : null;
    String fullName = account != null && account.getFullName() != null ? account.getFullName() : "";
    String avatarUrl = account != null ? account.getAvatarUrl() : null;

    UserProfile profile = userProfileRepository.findById(userId).orElse(null);
    boolean profileCompleted = isProfileCompleted(profile);
    int profileCompletionPercent = calculateProfileCompletion(profile);

    long savedJobsCount = userSaveJobRepository.countByUserId(userId);
    long unreadNotificationCount = notificationService.getUnreadCount(userId, RecipientType.USER);

    Page<ApplyFormSentToJob> applicationsPage =
        applyFormSentToJobRepository.findByUserId(
            userId, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "timeSent")));

    long totalApplications = applyFormSentToJobRepository.countByUserId(userId);
    List<CandidateDashboardStats.RecentApplicationResponse> recentApplications = new ArrayList<>();

    for (ApplyFormSentToJob app : applicationsPage.getContent()) {
      ApplyForm form = null;
      try {
        form =
            applyFormSentToJobRepository
                .findById(app.getId())
                .map(
                    a -> {
                      var f = new ApplyForm();
                      f.setId(a.getId().getApplyFormId());
                      f.setUserId(a.getId().getApplyFormId());
                      return f;
                    })
                .orElse(null);
      } catch (Exception e) {
      }

      Long formId = app.getId().getApplyFormId();
      Long jobId = app.getId().getJobId();

      Job job = jobRepository.findById(jobId).orElse(null);
      Company company = job != null ? job.getCompany() : null;

      recentApplications.add(
          CandidateDashboardStats.RecentApplicationResponse.builder()
              .id(formId)
              .companyName(company != null ? company.getName() : "Công ty ẩn danh")
              .companyLogo(company != null ? company.getLogoUrl() : null)
              .jobPosition(job != null ? job.getTitle() : "Không rõ vị trí")
              .appliedAt(app.getTimeSent() != null ? app.getTimeSent().toString() : null)
              .status(app.getStatus() != null ? app.getStatus().name() : "PENDING")
              .build());
    }

    return CandidateDashboardStats.builder()
        .fullName(fullName)
        .avatarUrl(avatarUrl)
        .profileCompleted(profileCompleted)
        .profileCompletionPercent(profileCompletionPercent)
        .savedJobsCount(savedJobsCount)
        .unreadNotificationCount(unreadNotificationCount)
        .totalApplications(totalApplications)
        .recentApplications(recentApplications)
        .build();
  }

  private boolean isProfileCompleted(UserProfile profile) {
    if (profile == null) return false;
    return profile.getHeadline() != null
        && !profile.getHeadline().isEmpty()
        && profile.getShortBio() != null
        && !profile.getShortBio().isEmpty()
        && profile.getTotalExperienceYears() != null
        && profile.getEducationSummary() != null;
  }

  private int calculateProfileCompletion(UserProfile profile) {
    if (profile == null) return 0;
    int score = 0;
    int total = 6;

    if (profile.getHeadline() != null && !profile.getHeadline().isEmpty()) score++;
    if (profile.getLocation() != null && !profile.getLocation().isEmpty()) score++;
    if (profile.getShortBio() != null && !profile.getShortBio().isEmpty()) score++;
    if (profile.getTotalExperienceYears() != null) score++;
    if (profile.getEducationSummary() != null) score++;
    if (profile.getSkills() != null && !profile.getSkills().isEmpty()) score++;

    return (int) ((score * 100.0) / total);
  }
}

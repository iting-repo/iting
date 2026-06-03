package com.iting.jobportal.company.service.impl;

import com.iting.jobportal.company.dto.response.FollowedCompanyResponse;
import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.company.entity.UserFollowCompany;
import com.iting.jobportal.company.repository.CompanyRepository;
import com.iting.jobportal.company.repository.UserFollowCompanyRepository;
import com.iting.jobportal.company.service.CompanyFollowService;
import com.iting.jobportal.notification.entity.Notification;
import com.iting.jobportal.notification.enums.NotificationType;
import com.iting.jobportal.notification.enums.RecipientType;
import com.iting.jobportal.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyFollowServiceImpl implements CompanyFollowService {

  private final UserFollowCompanyRepository userFollowCompanyRepository;
  private final CompanyRepository companyRepository;
  private final NotificationRepository notificationRepository;

  @Override
  @Transactional
  public void followCompany(Long userId, Long companyId) {
    // Check if company exists
    Company company =
        companyRepository
            .findById(companyId)
            .orElseThrow(() -> new RuntimeException("Company not found"));

    // Check if already following
    if (userFollowCompanyRepository.existsByUserIdAndCompanyId(userId, companyId)) {
      throw new RuntimeException("Bạn đã theo dõi công ty này rồi");
    }

    // Create follow relationship
    UserFollowCompany follow =
        UserFollowCompany.builder().userId(userId).companyId(companyId).build();

    Notification notification =
        Notification.builder()
            .recipientId(userId)
            .recipientType(RecipientType.USER)
            .type(NotificationType.SYSTEM)
            .content("Bạn đã theo dõi công ty " + company.getName())
            .entityType("COMPANY")
            .entityId(companyId)
            .actionUrl("/companies/" + companyId)
            .build();

    notificationRepository.save(notification);
    userFollowCompanyRepository.save(follow);
  }

  @Override
  @Transactional
  public void unfollowCompany(Long userId, Long companyId) {
    // Check if currently following
    if (!userFollowCompanyRepository.existsByUserIdAndCompanyId(userId, companyId)) {
      throw new RuntimeException("Bạn chưa theo dõi công ty này");
    }

    // Remove follow relationship (cascade will handle notification deletion)
    userFollowCompanyRepository.deleteByUserIdAndCompanyId(userId, companyId);
  }

  @Override
  public boolean isFollowing(Long userId, Long companyId) {
    return userFollowCompanyRepository.existsByUserIdAndCompanyId(userId, companyId);
  }

  @Override
  public Page<FollowedCompanyResponse> getFollowedCompanies(Long userId, int page, int size) {
    // Validate pagination
    if (page < 0) page = 0;
    if (size <= 0 || size > 100) size = 10;

    Pageable pageable = PageRequest.of(page, size, Sort.by("followDate").descending());
    Page<UserFollowCompany> followPage = userFollowCompanyRepository.findByUserId(userId, pageable);

    // Map to FollowedCompanyResponse
    return followPage.map(
        follow -> {
          Company company = companyRepository.findById(follow.getCompanyId()).orElse(null);

          if (company == null) {
            return null;
          }

          return new FollowedCompanyResponse(
              company.getId(),
              company.getName(),
              company.getLogoUrl(),
              company.getIndustries(),
              follow.getFollowDate());
        });
  }

  @Override
  public Long getFollowerCount(Long companyId) {
    return userFollowCompanyRepository.countByCompanyId(companyId);
  }
}

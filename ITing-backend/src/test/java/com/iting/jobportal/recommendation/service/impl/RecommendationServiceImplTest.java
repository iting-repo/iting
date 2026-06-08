package com.iting.jobportal.recommendation.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.iting.jobportal.company.entity.Company;
import com.iting.jobportal.job.dto.response.JobResponse;
import com.iting.jobportal.job.entity.Job;
import com.iting.jobportal.job.entity.enums.JobStatus;
import com.iting.jobportal.job.repository.JobRepository;
import com.iting.jobportal.job.service.JobEmbeddingService;
import com.iting.jobportal.job.service.UserSavedJobService;
import com.iting.jobportal.recommendation.repository.UserJobInteractionRepository;
import com.iting.jobportal.recommendation.repository.UserSearchHistoryRepository;
import com.iting.jobportal.recommendation.service.InteractionService;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.entity.Skill;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/**
 * Kiểm thử việc seed sở thích từ hồ sơ ứng viên (UserProfile) trong recommendation: người dùng CHƯA
 * có hành vi nhưng có location/skills trong hồ sơ thì job cùng khu vực phải được ưu tiên.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RecommendationServiceImplTest {

  @Mock private JobRepository jobRepository;
  @Mock private InteractionService interactionService;
  @Mock private UserRepository userRepository;
  @Mock private CVRepository cvRepository;
  @Mock private UserSearchHistoryRepository searchHistoryRepository;
  @Mock private UserJobInteractionRepository interactionRepository;
  @Mock private JobEmbeddingService jobEmbeddingService;
  @Mock private UserSavedJobService userSavedJobService;
  @Mock private UserProfileRepository userProfileRepository;

  @InjectMocks private RecommendationServiceImpl service;

  private static final Long USER_ID = 1L;

  private Company company(long id, String name) {
    Company c = new Company();
    c.setId(id);
    c.setName(name);
    c.setActive(true);
    return c;
  }

  private Job job(long id, Company company, String province) {
    return Job.builder()
        .id(id)
        .company(company)
        .title("Java Backend Developer")
        .position("Backend")
        .skills(List.of("Java"))
        .province(province)
        .status(JobStatus.ACTIVE)
        .viewCount(0)
        .applicationCount(0)
        .createdAt(LocalDateTime.now())
        .build();
  }

  /** Dựng kịch bản: user mới (không hành vi), hồ sơ ở TP.HCM, có 2 job giống hệt khác mỗi tỉnh. */
  private void stubColdUserWithProfile(UserProfile profile, List<Job> pool) {
    when(interactionService.hasEnoughBehavior(USER_ID)).thenReturn(false);
    when(userRepository.findById(USER_ID)).thenReturn(Optional.of(org.mockito.Mockito.mock(User.class)));

    // Không loại trừ gì
    when(interactionRepository.findAppliedJobIds(USER_ID)).thenReturn(Collections.<Long>emptySet());
    when(userSavedJobService.getSavedJobIds(USER_ID)).thenReturn(Collections.<Long>emptyList());

    when(jobRepository.findActiveCandidatesForRecommendation(any())).thenReturn(pool);
    when(searchHistoryRepository.findByAccountIdOrderByCreatedAtDesc(eq(USER_ID), any()))
        .thenReturn(Collections.emptyList());
    when(interactionRepository.findRecentInteractionsWithJobs(eq(USER_ID), any()))
        .thenReturn(Collections.emptyList());
    when(cvRepository.findActiveCvEmbeddingByProfileId(eq(USER_ID), any()))
        .thenReturn(Collections.emptyList());
    when(userProfileRepository.findByAccount_Id(USER_ID)).thenReturn(Optional.ofNullable(profile));
  }

  private UserProfile hcmProfile() {
    UserProfile p = new UserProfile();
    p.setLocation("Quận 1, TP. Hồ Chí Minh");
    p.setHeadline("Senior Java Backend Developer");
    Skill java = new Skill();
    java.setName("Java");
    p.setSkills(List.of(java));
    return p;
  }

  @Test
  void coldUser_profileInHcm_prefersHcmJobOverHanoi() {
    Job hcm = job(1L, company(10L, "Cty HCM"), "TP. Hồ Chí Minh");
    Job hanoi = job(2L, company(20L, "Cty Hà Nội"), "Hà Nội");
    // Đặt Hà Nội trước trong pool để chứng minh location (không phải thứ tự pool) quyết định.
    stubColdUserWithProfile(hcmProfile(), List.of(hanoi, hcm));

    List<JobResponse> result = service.recommendHomepage(USER_ID, 10);

    assertThat(result).hasSize(2);
    assertThat(result.get(0).getProvince()).isEqualTo("TP. Hồ Chí Minh");
    assertThat(result.get(0).getCompanyName()).isEqualTo("Cty HCM");
  }

  @Test
  void coldUser_profileCityMatchesJobWrittenWithoutPrefix() {
    // Hồ sơ "Quận 1, TP. Hồ Chí Minh" vẫn khớp job ghi gọn "Hồ Chí Minh" (contains 2 chiều).
    Job hcm = job(1L, company(10L, "Cty HCM"), "Hồ Chí Minh");
    Job hanoi = job(2L, company(20L, "Cty Hà Nội"), "Hà Nội");
    stubColdUserWithProfile(hcmProfile(), List.of(hanoi, hcm));

    List<JobResponse> result = service.recommendHomepage(USER_ID, 10);

    assertThat(result.get(0).getProvince()).isEqualTo("Hồ Chí Minh");
  }

  @Test
  void coldUser_withoutProfile_stillReturnsJobsWithoutError() {
    Job hcm = job(1L, company(10L, "Cty HCM"), "TP. Hồ Chí Minh");
    Job hanoi = job(2L, company(20L, "Cty Hà Nội"), "Hà Nội");
    stubColdUserWithProfile(null, List.of(hcm, hanoi)); // không có hồ sơ

    List<JobResponse> result = service.recommendHomepage(USER_ID, 10);

    assertThat(result).hasSize(2); // không crash, vẫn trả về
  }
}

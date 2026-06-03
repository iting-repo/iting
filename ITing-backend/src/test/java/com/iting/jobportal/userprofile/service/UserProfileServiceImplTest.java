package com.iting.jobportal.userprofile.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.exception.ResourceNotFoundException;
import com.iting.jobportal.auth.repository.AccountRepository;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.userprofile.dto.request.CVRequest;
import com.iting.jobportal.userprofile.dto.request.UserProfileUpdateDto;
import com.iting.jobportal.userprofile.entity.CV;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.entity.enums.EmploymentStatus;
import com.iting.jobportal.userprofile.repository.CVRepository;
import com.iting.jobportal.userprofile.repository.CertificateRepository;
import com.iting.jobportal.userprofile.repository.EducationRepository;
import com.iting.jobportal.userprofile.repository.ExperienceRepository;
import com.iting.jobportal.userprofile.repository.PortfolioRepository;
import com.iting.jobportal.userprofile.repository.SkillRepository;
import com.iting.jobportal.userprofile.repository.SocialLinkRepository;
import com.iting.jobportal.userprofile.repository.UserProfileRepository;
import com.iting.jobportal.userprofile.service.impl.UserProfileServiceImpl;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceImplTest {

  @Mock private UserProfileRepository userProfileRepo;
  @Mock private UserRepository userRepository;
  @Mock private EducationRepository educationRepo;
  @Mock private SkillRepository skillRepo;
  @Mock private CertificateRepository certificateRepo;
  @Mock private ExperienceRepository experienceRepo;
  @Mock private PortfolioRepository portfolioRepo;
  @Mock private CVRepository cvRepo;
  @Mock private SocialLinkRepository socialRepo;
  @Mock private AccountRepository accountRepository;

  @InjectMocks private UserProfileServiceImpl userProfileService;

  @Test
  void getProfile_whenMissing_shouldThrow() {
    when(userProfileRepo.findById(1L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> userProfileService.getProfile(1L));
  }

  @Test
  void updateProfile_shouldCreateProfileWhenAbsent() {
    User user = new User();
    user.setId(1L);
    when(userProfileRepo.findById(1L)).thenReturn(Optional.empty());
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(userProfileRepo.save(any(UserProfile.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    UserProfileUpdateDto dto = new UserProfileUpdateDto();
    dto.setHeadline("Backend Developer");
    dto.setEmploymentStatus(EmploymentStatus.OPEN_TO_OPPORTUNITIES);
    dto.setOpenToWork(true);

    userProfileService.updateProfile(1L, dto);

    ArgumentCaptor<UserProfile> captor = ArgumentCaptor.forClass(UserProfile.class);
    verify(userProfileRepo, atLeastOnce()).save(captor.capture());
    assertEquals("Backend Developer", captor.getValue().getHeadline());
    assertEquals(EmploymentStatus.OPEN_TO_OPPORTUNITIES, captor.getValue().getEmploymentStatus());
  }

  @Test
  void addCV_whenDefault_shouldResetExistingDefaults() {
    UserProfile profile = new UserProfile();
    profile.setId(1L);
    CV existingDefault = new CV();
    existingDefault.setId(100L);
    existingDefault.setIsDefault(true);

    when(userProfileRepo.findById(1L)).thenReturn(Optional.of(profile));
    when(cvRepo.findByProfile_Id(1L)).thenReturn(List.of(existingDefault));
    when(cvRepo.save(any(CV.class))).thenAnswer(invocation -> invocation.getArgument(0));

    CVRequest request = new CVRequest();
    request.setTitle("My CV");
    request.setFileUrl("/cv.pdf");
    request.setIsDefault(true);

    CV result = userProfileService.addCV(1L, request);

    assertFalse(existingDefault.getIsDefault());
    assertEquals("My CV", result.getTitle());
    assertEquals(Boolean.TRUE, result.getIsDefault());
    verify(cvRepo).save(existingDefault);
  }

  @Test
  void setDefaultCV_shouldResetCurrentDefaultAndSetTarget() {
    CV existingDefault = new CV();
    existingDefault.setId(100L);
    existingDefault.setIsDefault(true);
    CV target = new CV();
    target.setId(101L);
    target.setIsDefault(false);

    when(cvRepo.findByProfile_Id(1L)).thenReturn(List.of(existingDefault));
    when(cvRepo.findById(101L)).thenReturn(Optional.of(target));

    userProfileService.setDefaultCV(1L, 101L);

    assertFalse(existingDefault.getIsDefault());
    assertEquals(Boolean.TRUE, target.getIsDefault());
    verify(cvRepo).save(existingDefault);
    verify(cvRepo).save(target);
  }
}

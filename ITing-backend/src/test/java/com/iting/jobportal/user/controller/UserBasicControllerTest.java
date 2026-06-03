package com.iting.jobportal.user.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.service.UserService;
import com.iting.jobportal.userprofile.entity.UserProfile;
import com.iting.jobportal.userprofile.service.UserProfileService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class UserBasicControllerTest {

  @Mock private UserService userService;
  @Mock private UserProfileService userProfileService;
  @InjectMocks private UserBasicController controller;

  @Test
  void updateBasic_callsService_returnsString() {
    UpdateUserRequest req = new UpdateUserRequest();
    String result = controller.updateBasic(1L, req);

    verify(userService).updateBasic(1L, req);
    assertEquals("Profile updated successfully", result);
  }

  @Test
  void getMyProfile_mapsAllFields_withNullDefaults() {
    // fullName/avatarUrl/phone là convenience accessors delegate sang
    // user.getAccount() — phải set qua chain Account → User → Profile.
    com.iting.jobportal.auth.entity.Account account = new com.iting.jobportal.auth.entity.Account();
    account.setFullName("Nguyen Van A");
    account.setAvatarUrl("https://s3/a.jpg");
    com.iting.jobportal.user.entity.User user = new com.iting.jobportal.user.entity.User();
    user.setAccount(account);

    UserProfile profile = new UserProfile();
    profile.setId(1L);
    profile.setUser(user);
    profile.setHeadline("Senior Dev");
    profile.setLocation("HCM");
    profile.setTotalExperienceYears(5);
    profile.setShortBio("bio");
    profile.setOpenToWork(true);
    when(userProfileService.getProfile(1L)).thenReturn(profile);

    ResponseEntity<?> resp = controller.getMyProfile(1L);

    Map<?, ?> body = (Map<?, ?>) resp.getBody();
    assertEquals(1L, body.get("id"));
    assertEquals("Senior Dev", body.get("headline"));
    assertEquals("HCM", body.get("location"));
    assertEquals(5, body.get("totalExperienceYears"));
    assertEquals("bio", body.get("shortBio"));
    assertEquals(true, body.get("openToWork"));
    assertEquals("Nguyen Van A", body.get("fullName"));
    assertEquals("https://s3/a.jpg", body.get("avatarUrl"));
  }

  @Test
  void getMyProfile_allNulls_returnEmptyStringsAndZero() {
    UserProfile profile = new UserProfile();
    profile.setId(1L);
    // Tất cả field còn lại = null
    when(userProfileService.getProfile(1L)).thenReturn(profile);

    Map<?, ?> body = (Map<?, ?>) controller.getMyProfile(1L).getBody();
    assertEquals("", body.get("headline"));
    assertEquals("", body.get("location"));
    assertEquals(0, body.get("totalExperienceYears"));
    assertEquals("", body.get("shortBio"));
    assertEquals(true, body.get("openToWork"), "Entity default openToWork=true");
    assertEquals("", body.get("fullName"));
    assertEquals("", body.get("avatarUrl"));
  }

  @Test
  void toggleOpenToWork_true_returnsOnMessage() {
    UserProfile profile = new UserProfile();
    when(userProfileService.getProfile(1L)).thenReturn(profile);

    ResponseEntity<?> resp = controller.toggleOpenToWork(1L, true);

    verify(userProfileService).updateOpenToWork(1L, true);
    Map<?, ?> body = (Map<?, ?>) resp.getBody();
    assertEquals("Đã bật tìm việc", body.get("message"));
    assertEquals(true, body.get("openToWork"));
  }

  @Test
  void toggleOpenToWork_false_returnsOffMessage() {
    UserProfile profile = new UserProfile();
    when(userProfileService.getProfile(1L)).thenReturn(profile);

    ResponseEntity<?> resp = controller.toggleOpenToWork(1L, false);

    verify(userProfileService).updateOpenToWork(1L, false);
    Map<?, ?> body = (Map<?, ?>) resp.getBody();
    assertEquals("Đã tắt tìm việc", body.get("message"));
    assertEquals(false, body.get("openToWork"));
  }
}

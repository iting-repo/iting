package com.iting.jobportal.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.user.dto.request.PersonalUpdateDto;
import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.user.service.impl.UserServiceImpl;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

  @Mock private UserRepository userRepository;

  @Mock private FileUploadService fileUploadService;

  @InjectMocks private UserServiceImpl userService;

  @Test
  void getProfile_shouldMapUserAndAccountEmail() {
    Account account =
        Account.builder()
            .id(1L)
            .email("user@test.com")
            .fullName("Test User")
            .phone("0909")
            .avatarUrl("/avatar.png")
            .build();
    User user = new User();
    user.setId(1L);
    user.setAccount(account);

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));

    UserProfileResponse response = userService.getProfile(1L);

    assertNotNull(response);
    assertEquals("Test User", response.getFullName());
    assertEquals("user@test.com", response.getEmail());
    assertEquals("/avatar.png", response.getAvatarUrl());
  }

  @Test
  void updateBasic_shouldUpdateAccountFieldsAndEmail() {
    Account account = Account.builder().id(1L).email("old@test.com").build();
    User user = new User();
    user.setId(1L);
    user.setAccount(account);

    UpdateUserRequest request = new UpdateUserRequest();
    request.setFullName("New Name");
    request.setPhoneNum("0123");
    request.setAvatarUrl("/new.png");
    request.setEmail("new@test.com");

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));

    userService.updateBasic(1L, request);

    assertEquals("New Name", account.getFullName());
    assertEquals("0123", account.getPhone());
    assertEquals("/new.png", account.getAvatarUrl());
    assertEquals("new@test.com", account.getEmail());
  }

  @Test
  void updatePersonal_shouldOnlyUpdateProvidedFields() {
    Account account =
        Account.builder().id(1L).fullName("Old").phone("0909").avatarUrl("/old.png").build();
    User user = new User();
    user.setId(1L);
    user.setAccount(account);

    PersonalUpdateDto dto = new PersonalUpdateDto();
    dto.setFullName("Updated");

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));

    userService.updatePersonal(1L, dto);

    assertEquals("Updated", account.getFullName());
    assertEquals("0909", account.getPhone());
    assertEquals("/old.png", account.getAvatarUrl());
  }

  @Test
  void uploadAvatar_shouldStoreUrlOnAccountAndReturnIt() {
    Account account = Account.builder().id(1L).build();
    User user = new User();
    user.setId(1L);
    user.setAccount(account);
    MockMultipartFile file =
        new MockMultipartFile("file", "avatar.png", "image/png", "x".getBytes());

    when(fileUploadService.uploadAvatar(file)).thenReturn("/uploads/avatar.png");
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));

    String result = userService.uploadAvatar(1L, file);

    assertEquals("/uploads/avatar.png", result);
    assertEquals("/uploads/avatar.png", account.getAvatarUrl());
  }

  @Test
  void deleteAvatar_shouldClearAvatar() {
    Account account = Account.builder().id(1L).avatarUrl("/avatar.png").build();
    User user = new User();
    user.setId(1L);
    user.setAccount(account);
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));

    userService.deleteAvatar(1L);

    assertNull(account.getAvatarUrl());
  }
}

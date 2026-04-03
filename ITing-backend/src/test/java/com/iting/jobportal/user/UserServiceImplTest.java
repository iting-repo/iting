package com.iting.jobportal.user;

import com.iting.jobportal.auth.entity.Account;
import com.iting.jobportal.file.FileUploadService;
import com.iting.jobportal.user.dto.request.PersonalUpdateDto;
import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import com.iting.jobportal.user.entity.User;
import com.iting.jobportal.user.repository.UserRepository;
import com.iting.jobportal.user.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileUploadService fileUploadService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void getProfile_shouldMapUserAndAccountEmail() {
        Account account = Account.builder().id(1L).email("user@test.com").build();
        User user = new User();
        user.setId(1L);
        user.setAccount(account);
        user.setFullName("Test User");
        user.setPhoneNum("0909");
        user.setAvatarUrl("/avatar.png");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getProfile(1L);

        assertNotNull(response);
        assertEquals("Test User", response.getFullName());
        assertEquals("user@test.com", response.getEmail());
        assertEquals("/avatar.png", response.getAvatarUrl());
    }

    @Test
    void updateBasic_shouldUpdateUserFieldsAndAccountEmail() {
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

        assertEquals("New Name", user.getFullName());
        assertEquals("0123", user.getPhoneNum());
        assertEquals("/new.png", user.getAvatarUrl());
        assertEquals("new@test.com", user.getAccount().getEmail());
    }

    @Test
    void updatePersonal_shouldOnlyUpdateProvidedFields() {
        User user = new User();
        user.setId(1L);
        user.setFullName("Old");
        user.setPhoneNum("0909");
        user.setAvatarUrl("/old.png");

        PersonalUpdateDto dto = new PersonalUpdateDto();
        dto.setFullName("Updated");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updatePersonal(1L, dto);

        assertEquals("Updated", user.getFullName());
        assertEquals("0909", user.getPhoneNum());
        assertEquals("/old.png", user.getAvatarUrl());
    }

    @Test
    void uploadAvatar_shouldStoreUrlOnUserAndReturnIt() {
        User user = new User();
        user.setId(1L);
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", "x".getBytes());

        when(fileUploadService.uploadAvatar(file)).thenReturn("/uploads/avatar.png");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        String result = userService.uploadAvatar(1L, file);

        assertEquals("/uploads/avatar.png", result);
        assertEquals("/uploads/avatar.png", user.getAvatarUrl());
    }

    @Test
    void deleteAvatar_shouldClearAvatar() {
        User user = new User();
        user.setId(1L);
        user.setAvatarUrl("/avatar.png");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.deleteAvatar(1L);

        assertNull(user.getAvatarUrl());
    }
}

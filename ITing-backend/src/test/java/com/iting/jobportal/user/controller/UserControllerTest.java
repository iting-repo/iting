package com.iting.jobportal.user.controller;

import com.iting.jobportal.user.dto.request.PersonalUpdateDto;
import com.iting.jobportal.user.dto.request.UpdateAvatarRequest;
import com.iting.jobportal.user.dto.request.UpdateUserRequest;
import com.iting.jobportal.user.dto.response.UserProfileResponse;
import com.iting.jobportal.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock private UserService userService;
    @InjectMocks private UserController controller;

    @Test
    void getProfile_delegates() {
        UserProfileResponse expected = new UserProfileResponse();
        when(userService.getProfile(1L)).thenReturn(expected);

        assertSame(expected, controller.getProfile(1L).getBody());
    }

    @Test
    void updateBasic_callsService_returnsMessage() {
        UpdateUserRequest req = new UpdateUserRequest();
        ResponseEntity<?> resp = controller.updateBasic(1L, req);

        verify(userService).updateBasic(1L, req);
        assertEquals("Updated", ((Map<?, ?>) resp.getBody()).get("message"));
    }

    @Test
    void updateAvatar_passesUrl() {
        UpdateAvatarRequest req = new UpdateAvatarRequest();
        req.setAvatarUrl("https://s3/new-avatar.jpg");

        ResponseEntity<?> resp = controller.updateAvatar(1L, req);

        verify(userService).updateAvatar(1L, "https://s3/new-avatar.jpg");
        assertEquals("Avatar updated", ((Map<?, ?>) resp.getBody()).get("message"));
    }

    @Test
    void uploadAvatar_returnsUrl() {
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", new byte[100]);
        when(userService.uploadAvatar(eq(1L), any(MultipartFile.class)))
                .thenReturn("https://s3/avatar.png");

        ResponseEntity<?> resp = controller.uploadAvatar(1L, file);

        assertEquals("https://s3/avatar.png", ((Map<?, ?>) resp.getBody()).get("avatarUrl"));
    }

    @Test
    void deleteAvatar_callsService_returnsMessage() {
        ResponseEntity<?> resp = controller.deleteAvatar(1L);

        verify(userService).deleteAvatar(1L);
        assertEquals("Avatar removed", ((Map<?, ?>) resp.getBody()).get("message"));
    }

    @Test
    void updatePersonal_callsService_returnsMessage() {
        PersonalUpdateDto dto = new PersonalUpdateDto();
        ResponseEntity<?> resp = controller.updatePersonal(1L, dto);

        verify(userService).updatePersonal(1L, dto);
        assertEquals("Personal information updated", ((Map<?, ?>) resp.getBody()).get("message"));
    }
}
